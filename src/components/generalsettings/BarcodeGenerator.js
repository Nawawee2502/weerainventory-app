import { pdf } from '@react-pdf/renderer';
import { Document, Page, View, Text, StyleSheet, Font, Image } from '@react-pdf/renderer';
import React from 'react';
import JsBarcode from 'jsbarcode';

// Register standard font
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 }
  ]
});

// Define styles for barcode stickers
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: 'Roboto',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 0,
  },
  sticker: {
    width: '33.33%', // 3 columns
    height: 120,
    padding: 5,
    boxSizing: 'border-box',
  },
  stickerContent: {
    border: '1px solid #000',
    height: '100%',
    borderRadius: 5,
    padding: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcode: {
    width: '90%',
    height: 60,
    marginBottom: 5,
  },
  productCode: {
    fontSize: 8,
    fontWeight: 700,
    marginBottom: 2,
    textAlign: 'center',
  },
  productName: {
    fontSize: 7,
    textAlign: 'center',
    marginBottom: 2,
  },
});

// Helper function to create barcode image
const createBarcodeImage = (text) => {
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    
    // Generate the barcode on the canvas
    JsBarcode(canvas, text, {
      format: 'CODE128',
      displayValue: false,
      width: 2,
      height: 50,
      margin: 0
    });
    
    // Convert canvas to data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating barcode:', error);
    return null;
  }
};

// Create the barcode document
const BarcodePDF = ({ productData }) => {
  // Pre-generate all barcode images
  const barcodeImages = {};
  productData.forEach(item => {
    barcodeImages[item.product_code] = createBarcodeImage(item.product_code);
  });
  
  // Flatten the product data by repeating each product based on its count
  const flattenedData = [];
  productData.forEach(item => {
    for (let i = 0; i < item.count; i++) {
      flattenedData.push({
        product_code: item.product_code,
        product_name: item.product_name,
        barcodeImage: barcodeImages[item.product_code]
      });
    }
  });

  // Calculate the number of full rows needed
  const numberOfRows = Math.ceil(flattenedData.length / 3);
  
  // Create an array of rows
  const rows = Array.from({ length: numberOfRows }, (_, rowIndex) => {
    const startIdx = rowIndex * 3;
    return flattenedData.slice(startIdx, startIdx + 3);
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {rows.map((row, rowIndex) => (
          <View style={styles.row} key={`row-${rowIndex}`}>
            {row.map((item, colIndex) => (
              <View style={styles.sticker} key={`sticker-${rowIndex}-${colIndex}`}>
                <View style={styles.stickerContent}>
                  {item.barcodeImage && (
                    <Image src={item.barcodeImage} style={styles.barcode} />
                  )}
                  <Text style={styles.productCode}>{item.product_code}</Text>
                  <Text style={styles.productName}>{item.product_name}</Text>
                </View>
              </View>
            ))}
            {/* Add empty stickers to fill the row if needed */}
            {Array.from({ length: 3 - row.length }, (_, i) => (
              <View style={styles.sticker} key={`empty-${rowIndex}-${i}`} />
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};

// Function to generate and download the barcode PDF
export const generateBarcodePDF = async (productData) => {
  try {
    if (!productData || productData.length === 0) {
      throw new Error('No product data provided');
    }

    // Create the PDF document
    const barcodeDocument = <BarcodePDF productData={productData} />;
    
    // Generate the PDF blob
    const blob = await pdf(barcodeDocument).toBlob();
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = `product-barcodes-${new Date().toISOString().slice(0, 10)}.pdf`;
    
    // Append the link to the body, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    return true;
  } catch (error) {
    console.error('Error generating barcode PDF:', error);
    throw error;
  }
};
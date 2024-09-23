const initialState = {
    typeproducts: [], // or null or {} depending on your data structure
    loading: false,
    error: null
};

const typeproductReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_TYPEPRODUCTS_SUCCESS':
            return {
                ...state,
                typeproducts: action.payload,
                loading: false
            };
        case 'FETCH_TYPEPRODUCTS_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false
            };
        default:
            return state;
    }
};

export default typeproductReducer;

import jsonToFormData from 'json-form-data';

export const bodyToFetch = (params, formData, showLeafArrayIndexes = true) => {
    if (formData) {
        return jsonToFormData(params, { showLeafArrayIndexes });
    }
    return params;
};

export const createFormDataWithFiles = (data, files = []) => {
    const formData = new FormData();

    // Agregar datos del formulario
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (typeof value === 'string') {
            formData.append(key, value);
        } else if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
        }
    });

    // Agregar archivos
    files.forEach((file, index) => {
        formData.append(`payment_evidences[${index}]`, file);
    });

    return formData;
};

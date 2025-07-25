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

export const getMethodLabel = (method) => {
    const labels = {
      cash_usd: 'Efectivo USD',
      cash_local: 'Efectivo VES',
      card_usd: 'Tarjeta USD',
      card_local: 'Tarjeta VES',
      transfer_usd: 'Transferencia USD',
      transfer_local: 'Transferencia VES',
      crypto: 'Crypto',
    };
    return labels[method] || method;
  };

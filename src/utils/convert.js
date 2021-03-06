// 把json批量转成formdata
export function jsonToFormData(json) {
  const formData = new FormData();
  Object.keys(json).forEach(key => {
    formData.append(key, json[key]);
  });
  return formData;
}

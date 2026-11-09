export function lerImagem(file, limiteMB = 2) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    if (!/^image\/(png|jpeg|webp)$/i.test(file.type)) {
      reject(new Error("Escolha uma imagem PNG, JPG ou WEBP."));
      return;
    }
    if (file.size > limiteMB * 1024 * 1024) {
      reject(new Error(`A imagem deve ter no m\u00e1ximo ${limiteMB} MB.`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("N\u00e3o foi poss\u00edvel ler a imagem."));
    reader.readAsDataURL(file);
  });
}

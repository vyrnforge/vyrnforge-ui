export default {
  id: 'file-input', exportName: 'FileInput', angularName: 'VfFileInputDirective', hook: 'data-vf-file-input',
  markup: '<label for="control">File</label><input id="control" name="upload" type="file" accept=".txt,text/plain" capture="environment" multiple data-vf-file-input>',
  angular: '<label for="control">File</label><input id="control" name="upload" vfFileInput accept=".txt,text/plain" capture="environment" multiple>', props: { name: 'upload', accept: '.txt,text/plain', capture: 'environment', multiple: true }, semantics: { tag: 'INPUT', type: 'file' },
  async assertBrowser({ control, expect }) {
    await control.blur();
    await expect(control).toHaveCSS('border-color', 'rgb(113, 113, 122)');
    await expect(control).toHaveAttribute('accept', '.txt,text/plain');
    await expect(control).toHaveAttribute('capture', 'environment');
    expect(await control.evaluate((element) => element.multiple)).toBe(true);
    await control.setInputFiles([
      { name: 'sample-a.txt', mimeType: 'text/plain', buffer: Buffer.from('sample-a') },
      { name: 'sample-b.txt', mimeType: 'text/plain', buffer: Buffer.from('sample-b') },
    ]);
    expect(await control.evaluate((element) => Array.from(element.files ?? [], (file) => file.name))).toEqual(['sample-a.txt', 'sample-b.txt']);
    expect(await control.evaluate((element) => Array.from(new FormData(element.form).getAll('upload'), (file) => file.name))).toEqual(['sample-a.txt', 'sample-b.txt']);
    await control.evaluate((element) => element.form.reset());
    expect(await control.evaluate((element) => element.files?.length ?? 0)).toBe(0);
  },
};

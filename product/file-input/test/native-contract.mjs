export default {
  id: 'file-input', exportName: 'FileInput', angularName: 'VfFileInputDirective', hook: 'data-vf-file-input',
  markup: '<label for="control">File</label><input id="control" name="upload" type="file" data-vf-file-input>',
  angular: '<label for="control">File</label><input id="control" name="upload" vfFileInput>', props: { name: 'upload' }, semantics: { tag: 'INPUT', type: 'file' },
  async assertBrowser({ control, expect }) { await control.setInputFiles({ name: 'sample.txt', mimeType: 'text/plain', buffer: Buffer.from('sample') }); expect(await control.evaluate((element) => element.files?.[0]?.name)).toBe('sample.txt'); },
};

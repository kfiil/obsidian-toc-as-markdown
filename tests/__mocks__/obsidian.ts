export class Plugin {
  app: any;
  manifest: any;
  
  constructor(app: any, manifest: any) {
    this.app = app;
    this.manifest = manifest;
  }
  
  onload() {}
  onunload() {}
  loadData() { return Promise.resolve({}); }
  saveData() { return Promise.resolve(); }
  registerEvent() {}
}

export class TFile {
  extension: string = '';
  name: string = '';
  path: string = '';
  vault: any;
  parent: any;
}

export class TFolder {
  name: string = '';
  path: string = '';
  isRoot: () => boolean = () => false;
  vault: any;
  parent: any;
  children: any[] = [];
}

export class Menu {
  addItem = jest.fn((callback) => {
    const mockItem = {
      setTitle: jest.fn().mockReturnThis(),
      setIcon: jest.fn().mockReturnThis(),
      onClick: jest.fn().mockReturnThis()
    };
    callback(mockItem);
    return mockItem;
  });
}

export class MenuItem {
  setTitle = jest.fn().mockReturnThis();
  setIcon = jest.fn().mockReturnThis();
  onClick = jest.fn().mockReturnThis();
}
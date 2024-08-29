Promise.all([
    import('./components/content/parserToggle'),
    import('./components/content/urlParser'),
    import('./components/content/storage')
  ]).then(() => {
    console.log('Content script loaded');
  });
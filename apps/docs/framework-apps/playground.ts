let compilerPromise: Promise<any> | undefined;

export function loadCompiler(url: string) {
  compilerPromise ||= new Promise((resolve, reject) => {
    const existing = (globalThis as any).__vfDocsTypeScript;
    if (existing) {
      resolve(existing);
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.addEventListener('load', () => resolve((globalThis as any).__vfDocsTypeScript), { once: true });
    script.addEventListener('error', () => reject(new Error('Unable to load the live example compiler.')), { once: true });
    document.head.append(script);
  });
  return compilerPromise;
}

function stripSupportedImports(source: string, allowedImports: string[] = []) {
  const allowed = new Set(allowedImports);
  const pattern = /^\s*import\s+(?:[^'"\n]+?\s+from\s+)?['"]([^'"]+)['"];\s*$/gm;
  const stripped = source.replace(pattern, (_statement, specifier) => {
    if (!allowed.has(specifier)) throw new Error(`Live examples do not load arbitrary imports: ${specifier}`);
    return '';
  });
  if (/^\s*import\b/m.test(stripped)) throw new Error('Live examples currently support one-line import declarations only.');
  if (/^\s*export\b/m.test(stripped)) throw new Error('Live examples run as entry files; export declarations are not supported in the editor.');
  return stripped;
}

export function transpileExample(source: string, config: any, ts: any) {
  const bindings = config.bindings || [];
  const preamble = bindings.length ? `const { ${bindings.join(', ')} } = globalThis.__vfRuntime;` : '';
  const result = ts.transpileModule(`${preamble}\n${stripSupportedImports(source, config.imports)}`, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      experimentalDecorators: true,
      useDefineForClassFields: false,
    },
    reportDiagnostics: true,
  });
  const errors = (result.diagnostics || []).filter((diagnostic: any) => diagnostic.category === ts.DiagnosticCategory.Error);
  if (errors.length) {
    throw new Error(errors.map((diagnostic: any) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')).join('\n'));
  }
  return result.outputText;
}

function scriptSafe(value: string) {
  return value.replace(/<\/script/gi, '<\\/script');
}

export function liveExampleDocument({
  id,
  framework,
  code,
  runtimeUrl,
  stylesUrl,
  frameCssUrl,
}: {
  id: string;
  framework: string;
  code: string;
  runtimeUrl: string;
  stylesUrl: string;
  frameCssUrl: string;
}) {
  const rootMarkup = framework === 'angular'
    ? '<vf-example-root id="root" class="vf-example-root"></vf-example-root>'
    : '<main id="root" class="vf-example-root"></main>';
  const report = `parent.postMessage({type:'vf-example-result',id:${JSON.stringify(id)},status:'ready'},'*')`;
  const reportError = `parent.postMessage({type:'vf-example-result',id:${JSON.stringify(id)},status:'error',message:String(error?.message || error)},'*')`;
  return `<!doctype html><html lang="en" data-vf-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="${stylesUrl}"><link rel="stylesheet" href="${frameCssUrl}"></head><body>${rootMarkup}<script>window.addEventListener('error',(event)=>parent.postMessage({type:'vf-example-result',id:${JSON.stringify(id)},status:'error',message:event.message || 'Runtime error'},'*'));window.addEventListener('unhandledrejection',(event)=>parent.postMessage({type:'vf-example-result',id:${JSON.stringify(id)},status:'error',message:String(event.reason?.message || event.reason || 'Unhandled rejection')},'*'));</script>${runtimeUrl ? `<script src="${runtimeUrl}"></script>` : ''}<script>try{${scriptSafe(code)}\nsetTimeout(()=>${report},0)}catch(error){${reportError}}</script></body></html>`;
}

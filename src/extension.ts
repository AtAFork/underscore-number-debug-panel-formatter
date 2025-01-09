import * as vscode from 'vscode';

// Format a single number
function formatNumberWithUnderscores(num: number): string {
  return num.toLocaleString('en-US').replace(/,/g, '_');
}

// Format all numbers found in a string
function formatAllNumbersInString(str: string): string {
  // Replace any whole numeric token with underscores
  return str.replace(/\b\d+\b/g, (match) => {
    const parsed = Number(match);
    return isNaN(parsed) ? match : formatNumberWithUnderscores(parsed);
  });
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.debug.registerDebugAdapterTrackerFactory('*', {
      createDebugAdapterTracker() {
        return {
          onDidSendMessage: (message) => {
            if (message.type === 'response') {
              // Format expanded variables
              if (message.command === 'variables' && message.body?.variables) {
                for (const variable of message.body.variables) {
                  if (typeof variable.value === 'string') {
                    variable.value = formatAllNumbersInString(variable.value);
                  }
                }
              }

              // Format watch/hover evaluations
              if (message.command === 'evaluate' && typeof message.body?.result === 'string') {
                message.body.result = formatAllNumbersInString(message.body.result);
              }
            }
          }
        };
      }
    })
  );

  vscode.debug.activeDebugConsole.appendLine('Number Debug Formatter Activated.');
}

export function deactivate() {}

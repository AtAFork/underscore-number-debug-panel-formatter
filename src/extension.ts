import * as vscode from 'vscode';

// Format a single number
function formatNumberWithUnderscores(num: number): string {
  // Split into integer and decimal parts
  const [intPart, decimalPart] = num.toString().split('.');
  // Format integer part with thousands separators converted to underscores
  const formattedInt = Math.abs(parseInt(intPart)).toLocaleString('en-US').replace(/,/g, '_');
  // Add negative sign back if needed
  const withSign = intPart.startsWith('-') ? `-${formattedInt}` : formattedInt;
  // Add back decimal part if it exists
  return decimalPart ? `${withSign}.${decimalPart}` : withSign;
}

// Format all numbers found in a string
function formatAllNumbersInString(str: string): string {
  // Replace any numeric token (including decimals and negative numbers)
  return str.replace(/\b-?\d+(\.\d+)?\b/g, (match) => {
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

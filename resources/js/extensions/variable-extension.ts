import { Node, mergeAttributes } from '@tiptap/core';

export interface VariableOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variable: {
      /**
       * Add a variable
       */
      setVariable: (variable: string) => ReturnType;
    };
  }
}

export const Variable = Node.create<VariableOptions>({
  name: 'variable',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      variable: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-variable': HTMLAttributes.variable,
        class: 'variable-tag bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-sm font-mono',
      }),
      `[[${HTMLAttributes.variable}]]`,
    ];
  },

  addCommands() {
    return {
      setVariable:
        (variable: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { variable },
          });
        },
    };
  },
});

import { Mark, mergeAttributes } from '@tiptap/core'

export interface AnnotationMarkOptions {
  HTMLAttributes: Record<string, string>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    annotationMark: {
      setAnnotation: (attributes: {
        id: string
        category: string
        severity: string
      }) => ReturnType
      unsetAnnotation: () => ReturnType
    }
  }
}

export const AnnotationMark = Mark.create<AnnotationMarkOptions>({
  name: 'annotation',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-annotation-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) return {}
          return { 'data-annotation-id': attributes.id }
        },
      },
      category: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-category'),
        renderHTML: (attributes) => {
          if (!attributes.category) return {}
          return { 'data-category': attributes.category }
        },
      },
      severity: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-severity'),
        renderHTML: (attributes) => {
          return { 'data-severity': attributes.severity }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-annotation-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const severity = HTMLAttributes['data-severity'] || 'info'
    const severityClasses: Record<string, string> = {
      info: 'bg-blue-100 dark:bg-blue-900/40 border-b-2 border-blue-400',
      warning: 'bg-yellow-100 dark:bg-yellow-900/40 border-b-2 border-yellow-400',
      error: 'bg-red-100 dark:bg-red-900/40 border-b-2 border-red-400',
    }

    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `annotation cursor-pointer hover:opacity-80 transition-opacity ${severityClasses[severity] || severityClasses.info}`,
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setAnnotation:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      unsetAnnotation:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})

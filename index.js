import {visit} from 'unist-util-visit'

export default function remarkAnchor() {
  // Attach the anchor compiler.
  const data = this.data();
  data.toMarkdownExtensions ||= []
  data.toMarkdownExtensions.push(mdastAnchorToMarkdown())

  // Return the anchor transformer.
  return mdastAnchor
}

// Transform an empty link node that has a nonempty data.hProperties.id into an anchor node.
// The anchor's value attribute exists to prevent the extra space added by remark-math-space.
function mdastAnchor(root) {
  visit(
    root,
    isTargetNode,
    (node, index, parent) => {
      const anchor = {
        type: 'anchor',
        position: node.position,
        value: '',
        id: node.data.hProperties.id
      }

      if (parent && typeof index === 'number') {
        parent.children[index] = anchor
      }
    }
  )

  function isTargetNode(node) {
    return node.type === 'link' &&
      node.children?.length === 0 &&
      node.url === '' &&
      node.title == null &&
      typeof node.data?.hProperties?.id === 'string' &&
      node.data.hProperties.id !== ''
  }
}

// Serialize the anchor node.
function mdastAnchorToMarkdown() {
  return {
    handlers: {
      anchor(node) {
        return node.id ? `[](){#${node.id}}` : ''
      }
    }
  }
}


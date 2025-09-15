'use strict'
import test from 'ava'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkAttributes from 'remark-attributes'
import remarkAnchor from '../index.js'
import remarkGfm from 'remark-gfm'

async function test_case (case_info, supported, text, expected) {
  if (!supported) {
    test.skip(case_info, t => {
      t.pass(`Skipped: ${case_info} (unsupported)`)
    })
    return
  }

  test(case_info, async t => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkAttributes)
      .use(remarkAnchor)
      .use(remarkGfm)
      .use(remarkStringify, {
        emphasis: '*',
        bullet: '-',
        listItemIndent: 'tab'
      })

    const output = String(await processor.process(text)).trim()
    t.deepEqual(output, expected)
  })
}

// Basic anchor transformation tests
test_case (
  "empty link with ID becomes anchor",
  true,
  "[](){#id}",
  "[](){#id}"
)

test_case (
  "empty link with shorthand ID syntax becomes anchor", 
  true,
  "[](){: #id}",
  "[](){#id}"
)

test_case (
  "empty link with spaced shorthand ID becomes anchor",
  true,
  "[](){:   #id   }",
  "[](){#id}"
)

test_case (
  "empty link with key-value ID syntax becomes anchor",
  true,
  "[](){id=ref-id}",
  "[](){#ref-id}"
)

// Link nodes that should NOT be transformed
test_case (
  "empty link without ID remains unchanged",
  true,
  "[]()",
  "[]()"
)

test_case (
  "link with text should not be transformed",
  true,
  "[text]()",
  "[text]()"
)

test_case (
  "link with URL should drop all attributes",
  true,
  "[](http://example.com){#id .class}",
  "[](http://example.com)"
)

test_case (
  "link with title should drop all attributes",
  true,
  "[](\"title\"){#id}",
  "[](\"title\")"
)

test_case (
  "link with URL and title should drop all attributes",
  true,
  "[](http://example.com \"title\"){#id .class key=value}",
  "[](http://example.com \"title\")"
)

test_case (
  "link with text and URL should drop all attributes",
  true,
  "[Click here](http://example.com){#id .class}",
  "[Click here](http://example.com)"
)

test_case (
  "link with text should drop all attributes including ID",
  true,
  "[text](){#id .class key=value}",
  "[text]()"
)

test_case (
  "link with text and shorthand attributes should drop all",
  true,
  "[text](){: #id .class}",
  "[text]()"
)

test_case (
  "link with children should drop all attributes",
  true,
  "[*emphasis*](){#id}",
  "[*emphasis*]()"
)

test_case (
  "link with whitespace URL should transform if valid ID",
  true,
  "[]( ){#id .class}",
  "[](){#id}"
)

test_case (
  "link with whitespace text should not transform",
  true,
  "[ ](){#id .class}",
  "[ ]()"
)

test_case (
  "link with empty title but URL should drop attributes",
  true,
  "[](http://example.com \"\"){#id}",
  "[](http://example.com)"
)

test_case (
  "link with complex text and attributes should drop all",
  true,
  "[**bold** and *italic*](){#id .class data-attr=value}",
  "[**bold** and *italic*]()"
)

test_case (
  "link with nested markdown and ID should drop attributes",
  true,
  "[`code` text](){#id}",
  "[`code` text]()"
)

test_case (
  "link with image as text should drop attributes",
  true,
  "[![alt](img.png)](){#id}",
  "[![alt](img.png)]()"
)

test_case (
  "link with text should ignore its id",
  true,
  "[text](){#id}",
  "[text]()"
)

// ID validation - empty or whitespace-only IDs
test_case (
  "empty link with empty ID should drop",
  true,
  "[](){#}",
  "[]()"
)

test_case (
  "empty link with whitespace-only ID should drop",
  true,
  "[](){#   }",
  "[]()"
)

test_case (
  "shorthand empty ID should drop",
  true,
  "[](){: #}",
  "[]()"
)

test_case (
  "shorthand whitespace-only ID should drop", 
  true,
  "[](){:   #   }",
  "[]()"
)

test_case (
  "empty link with only non-ID attributes should drop",
  true,
  "[](){.class key=value}",
  "[]()"
)

test_case (
  "empty link with class only should drop attributes",
  true,
  "[](){.myclass}",
  "[]()"
)

test_case (
  "empty link with key-value attributes should drop all",
  true,
  "[](){data-test=value role=button}",
  "[]()"
)

// Valid ID formats that should transform
test_case (
  "ID with dash becomes anchor",
  true,
  "[](){#my-id}",
  "[](){#my-id}"
)

test_case (
  "ID with underscore becomes anchor",
  true,
  "[](){#my_id}",
  "[](){#my_id}"
)

test_case (
  "numeric ID becomes anchor",
  true,
  "[](){#123}",
  "[](){#123}"
)

test_case (
  "alphanumeric ID becomes anchor",
  true,
  "[](){#id123}",
  "[](){#id123}"
)

test_case (
  "unicode ID becomes anchor",
  true,
  "[](){#定理}",
  "[](){#定理}"
)

test_case (
  "emoji in ID becomes anchor",
  true,
  "[](){#id🔥}",
  "[](){#id🔥}"
)

test_case (
  "ID with special characters becomes anchor",
  true,
  "[](){#$!@}",
  "[](){#$!@}"
)

// Multiple attributes - only ID matters for transformation
test_case (
  "empty link with ID and class becomes anchor (class ignored)",
  true,
  "[](){#id .class}",
  "[](){#id}"
)

test_case (
  "empty link with class and ID becomes anchor (class ignored)",
  true,
  "[](){.class #id}",
  "[](){#id}"
)

test_case (
  "empty link with multiple attributes becomes anchor (only ID kept)",
  true,
  "[](){.foo #my-id .bar key=value}",
  "[](){#my-id}"
)

// Multiple anchors
test_case (
  "multiple empty links with IDs become anchors",
  true,
  "[](){#id1}\n\n[](){#id2}",
  "[](){#id1}\n\n[](){#id2}"
)

test_case (
  "multiple inline empty links with IDs become anchors",
  true,
  "Start [](){#a} middle [](){#b} end",
  "Start [](){#a} middle [](){#b} end"
)

// Mixed content scenarios with attribute dropping
test_case (
  "mix of transformable links and links that drop attributes",
  true,
  "[Regular](url){.class} [](){#anchor} [text](){#id} [](){.class}",
  "[Regular](url) [](){#anchor} [text]() []()"
)

test_case (
  "empty links with and without valid IDs",
  true,
  "[](){.class} [](){#valid} [](){.class #} [](){#another}",
  "[]() [](){#valid} []() [](){#another}"
)

test_case (
  "complex mixed content with attribute dropping",
  true,
  "Text [link](url){.class} [](){#anchor1} **bold [text](){#id} text** [](){.only-class} end",
  "Text [link](url) [](){#anchor1} **bold [text]() text** []() end"
)

// Non-link elements should drop all attributes
test_case (
  "paragraph with ID attribute unaffected",
  true,
  "Paragraph text{: #para1}",
  "Paragraph text"
)

test_case (
  "heading with ID attribute unaffected",
  true,
  "# Title{: #heading1}",
  "# Title"
)

test_case (
  "image with ID attribute unaffected",
  true,
  "![Alt text](img.png){: #img1}",
  "![Alt text](img.png)"
)

test_case (
  "emphasis with ID attribute unaffected",
  true,
  "*Italic text*{: #italic1}",
  "*Italic text*"
)

test_case (
  "strong with ID attribute unaffected",
  true,
  "**Bold text**{: #bold1}",
  "**Bold text**"
)

test_case (
  "list item with ID attribute unaffected",
  true,
  "-   Item 1{: #item1}\n-   Item 2",
  "-   Item 1\n-   Item 2"
)

test_case (
  "code block with ID attribute unaffected",
  false,
  "```js{: #code1}\nconsole.log('hello');\n```",
  "```js\nconsole.log('hello');\n```"
)

// Anchor serialization edge cases
test_case (
  "anchor with complex ID serializes correctly",
  true,
  "[](){#complex-id_123}",
  "[](){#complex-id_123}"
)

test_case (
  "multiple anchors with different ID formats",
  true,
  "[](){#simple} [](){#with-dash} [](){#with_underscore} [](){#123}",
  "[](){#simple} [](){#with-dash} [](){#with_underscore} [](){#123}"
)

// Nested context preservation  
test_case (
  "anchors within other markdown elements",
  true,
  "> Blockquote with [](){#quote-anchor} anchor\n\n-   List item [](){#list-anchor}",
  "> Blockquote with [](){#quote-anchor} anchor\n\n-   List item [](){#list-anchor}"
)

test_case (
  "anchors in table context",
  true,
  "| Column 1 [](){#col1} | Column 2  |\n| -------------------- | --------- |\n| Data [](){#data}     | More data |",
  "| Column 1 [](){#col1} | Column 2  |\n| -------------------- | --------- |\n| Data [](){#data}     | More data |"
)

// Edge cases and malformed input (only for record)
// This part actually depends on the behavior of remark-attributes
// For more behaviors of remark-attributes, see <https://github.com/manuelmeister/remark-attributes/blob/main/test/index.ts>.
test_case (
  "malformed attributes syntax",
  true,
  "[](){#id .class",  // missing closing brace
  "[](){#id .class"
)

test_case (
  "empty attribute block",
  false,
  "[](){}",
  "[]()"
)

test_case (
  "whitespace only in attributes",
  true,
  "[](){   }",
  "[]()"
)

test_case (
  "duplicate IDs in attributes",
  true,
  "[](){#id1 #id2}",
  "[](){#id1}"
)

test_case (
  "duplicate IDs in attributes (another approach)",
  false,
  "[](){id=\"id1 id2\"}",
  "[](){#id1}"
)

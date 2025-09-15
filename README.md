# remark-anchor

仅用于 **OI Wiki** 相关仓库。借助 Markdown 的 [`attr_list`](https://python-markdown.github.io/extensions/attr_list/) 扩展可以实现 `[](){#id}` 形式的自定义锚点。本插件用于相关字段的解析和格式化。

## 预期行为

作为 [unified](https://github.com/unifiedjs/unified) 插件，本插件需满足以下加载顺序：

-   必须在 [remark-attributes](https://github.com/manuelmeister/remark-attributes) **之后** 引入。
-   若使用 [remark-math-space](https://github.com/OI-wiki/remark-math-space)，则必须在本插件 **之后** 引入。

插件功能如下：

-   仅识别 Markdown 中 `[](){#id}` 形式（或任何导致相同解析的字符串）的锚点标记。
    -   取决于 remark-attributes 的支持情况，其他与该语法等价并会产生相同解析结果的写法也同样有效。
-   **Transformer**：将含 `.data.hProperties.id` 的空 `link` 结点（`url` 为空，且无 `title` 与 `children`）转换为 `anchor` 结点。
    -   `anchor` 结点包含：
        -   `id` 字段：存储锚点名。
        -   `value` 字段：空字符串，用于避免干扰 remark-math-space。
-   **ToMarkdownExtension**：将 `anchor` 结点序列化为 `[](){#id}`。
-   除上述形式的锚点标记外，其他 `{}` 内的属性信息在 **Parse → Transform → Stringify** 过程中会被删除（因 remark-attributes 不支持反向序列化）。
-   不应干扰 remark-math-space 的空格插入。

## 依赖

仅依赖 [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) 包。

## 使用示例

输入 Markdown 文件：

```md
这里[](){#id}插入了一个锚点。

这里 [](){#id}插入了一个锚点。

这里[](){#id} 插入了一个锚点。

这里 [](){#id} 插入了一个锚点。

这里[](){#id}**插入**了一个锚点。

这里[](){#id}$x$了一个锚点。

- [](){#id}这里插入了一个锚点。
- [](){#id}**这里**插入了一个锚点。

| title 1 | title 2 |
| --- | --- |
| []( ){#id} | [](){                 #id} |

[](){#id}
```

处理脚本：

```js
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkCopywritingCorrect from 'remark-copywriting-correct'
import remarkAttributes from 'remark-attributes'
import remarkAnchor from './index.js'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkMathSpace from 'remark-math-space'

import { read } from 'to-vfile'

const processor = unified()
  .use(remarkParse)
  .use(remarkCopywritingCorrect)
  .use(remarkAttributes)
  .use(remarkAnchor)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkMathSpace)
  .use(remarkStringify, {
    emphasis: '*',
    bullet: '-',
    listItemIndent: 'tab'
  })

const output = await processor.process(await read('example.md'))
console.log(String(output))
```

输出结果：

```md
这里[](){#id}插入了一个锚点。

这里[](){#id}插入了一个锚点。

这里[](){#id}插入了一个锚点。

这里[](){#id}插入了一个锚点。

这里[](){#id} **插入** 了一个锚点。

这里[](){#id} $x$ 了一个锚点。

-   [](){#id}这里插入了一个锚点。
-   [](){#id}**这里** 插入了一个锚点。

| title 1   | title 2   |
| --------- | --------- |
| [](){#id} | [](){#id} |

[](){#id}
```

## 异常信息

无。

## 维护信息

代码结构：

-   `index.js`：实现 remark-anchor 功能。

测试目录：

-   `anchor.test.js`：测试锚点转换为 `[](){#id}` 的功能；
-   `anchor-spacing.test.js`：测试与 remark-math-space 的兼容性（保持空格正确）。

## 已知问题

由于 remark-attributes 功能 [尚不完整](https://github.com/manuelmeister/remark-attributes/blob/main/test/index.ts)，可能无法正确解析一部分情形的属性字符串。除此之外，remark-attributes 插件还存在以下问题：

-   遇到空锚点 `[](){}` 时，可能导致解析卡住。


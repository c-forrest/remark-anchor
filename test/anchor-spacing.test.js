'use strict'
import test from 'ava'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkCopywritingCorrect from 'remark-copywriting-correct'
import remarkAttributes from 'remark-attributes'
import remarkAnchor from '../index.js'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkMathSpace from 'remark-math-space'

async function test_case(case_info, supported, text, expected) {
  if (!supported) {
    test.skip(case_info, t => {
      t.pass(`Skipped: ${case_info} (unsupported)`);
    })
    return
  }

  test(case_info, async t => {
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

    const output = String(await processor.process(text))

    t.deepEqual(JSON.stringify(output.trim()), JSON.stringify(expected))
  })
}


test_case (
  "Chinese left, Chinese right",
  true,
  "我[](){#id}你。下一行继续。",
  "我[](){#id}你。下一行继续。"
)

test_case (
  "Chinese left, English right",
  true,
  "我[](){#id}World. Next line.",
  "我[](){#id}World. Next line."
)

test_case (
  "Chinese left, Punctuation right",
  true,
  "我[](){#id}，下一行继续。",
  "我[](){#id}，下一行继续。"
)

test_case (
  "English left, Chinese right",
  true,
  "Hello[](){#id}你在这里。",
  "Hello[](){#id}你在这里。"
)

test_case (
  "English left, English right",
  true,
  "Hello[](){#id}World.",
  "Hello[](){#id}World."
)

test_case (
  "Punctuation left, Chinese right",
  true,
  "，[](){#id}你来了。",
  "，[](){#id}你来了。"
)

test_case (
  "Punctuation left, English right",
  true,
  ",[](){#id}World continues.",
  ",[](){#id}World continues."
)

test_case (
  "Chinese before inline code",
  true,
  "测试[](){#id}`code`在这里。",
  "测试[](){#id} `code` 在这里。"
)

test_case (
  "Inline code before Chinese",
  true,
  "`code`[](){#id}测试结束。",
  "`code` [](){#id}测试结束。"
)

test_case (
  "Chinese before math",
  true,
  "数学[](){#id}$a+b$公式。",
  "数学[](){#id} $a+b$ 公式。"
)

test_case (
  "Math before Chinese",
  true,
  "$a+b$[](){#id}数学结束。",
  "$a+b$ [](){#id}数学结束。"
)

test_case (
  "Link before Chinese",
  true,
  "[link](http://a.com)[](){#id}中文",
  "[link](http://a.com) [](){#id}中文"
)

test_case (
  "Chinese before link",
  true,
  "中文[](){#id}[link](http://a.com)",
  "中文[](){#id} [link](http://a.com)"
)

test_case (
  "Chinese before bold, Chinese after",
  true,
  "我[](){#id}**强调**你。",
  "我[](){#id} **强调** 你。"
)

test_case (
  "Bold before Chinese",
  true,
  "**强调**[](){#id}你来了。",
  "**强调** [](){#id}你来了。"
)

test_case (
  "Chinese before bold (English inside), English after",
  true,
  "我[](){#id}**Bold**World",
  "我[](){#id} **Bold** World"
)

test_case (
  "English before bold, Chinese after",
  true,
  "Hello[](){#id}**强调**中文。",
  "Hello[](){#id} **强调** 中文。"
)

test_case (
  "Bold before English",
  true,
  "**Bold**[](){#id}World",
  "**Bold** [](){#id}World"
)

test_case (
  "Punctuation before bold, Chinese after",
  true,
  "，[](){#id}**强调**中文。",
  "，[](){#id}**强调** 中文。"
)

test_case (
  "Chinese before bold, punctuation after",
  true,
  "中文[](){#id}**强调**。",
  "中文[](){#id} **强调**。"
)

test_case (
  "Bold before punctuation",
  true,
  "**强调**[](){#id}。",
  "**强调**[](){#id}。"
)

test_case (
  "Bold before inline code",
  true,
  "**强调**[](){#id}`code`",
  "**强调** [](){#id} `code`"
)

test_case (
  "Inline code before bold",
  true,
  "`code`[](){#id}**强调**",
  "`code` [](){#id} **强调**"
)

test_case (
  "Bold before math",
  true,
  "**强调**[](){#id}$a+b$",
  "**强调** [](){#id} $a+b$"
)

test_case (
  "Math before bold",
  true,
  "$a+b$[](){#id}**强调**",
  "$a+b$ [](){#id} **强调**"
)

test_case (
  "Bold before link",
  true,
  "**强调**[](){#id}[link](http://a.com)",
  "**强调** [](){#id} [link](http://a.com)"
)

test_case (
  "Link before bold",
  true,
  "[link](http://a.com)[](){#id}**强调**",
  "[link](http://a.com) [](){#id} **强调**"
)

test_case (
  "List item starts with anchor then Chinese text",
  true,
  "-   [](){#id}项目一",
  "-   [](){#id}项目一"
)

test_case (
  "List item starts with anchor then English text",
  true,
  "-   [](){#id}Task one",
  "-   [](){#id}Task one"
)

test_case (
  "List item starts with anchor then bold Chinese text",
  true,
  "-   [](){#id}**重要**事项",
  "-   [](){#id}**重要** 事项"
)

test_case (
  "List item starts with anchor then bold English text",
  true,
  "-   [](){#id}**Important** task",
  "-   [](){#id}**Important** task"
)

test_case (
  "Table with anchor in first cell",
  true,
  "| [](){    #id    }苹果 | 香蕉 |\n| --- | --- |\n| 西瓜 | 葡萄 |",
  "| [](){#id}苹果 | 香蕉 |\n| ----------- | -- |\n| 西瓜          | 葡萄 |"
)

test_case (
  "Table with anchor in header",
  true,
  "| 标题[](){    #id } | 内容 |\n| --- | --- |\n| 数据 | 更多数据 |",
  "| 标题[](){#id} | 内容   |\n| ----------- | ---- |\n| 数据          | 更多数据 |"
)

test_case (
  "Table with anchor in second cell",
  true,
  "| A | B[](){#id}C |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 |",
  "| A | B[](){#id}C |\n| - | ----------- |\n| 1 | 2           |\n| 3 | 4           |"
)

test_case (
  "Table with multiple anchors",
  true,
  "| X[](){  #id1  }Y | Z[](){  #id2  }W |\n| --- | --- |\n| L[](){  #id3  }M | N[](){  #id4  }O |",
  "| X[](){#id1}Y | Z[](){#id2}W |\n| ------------ | ------------ |\n| L[](){#id3}M | N[](){#id4}O |"
)

test_case (
  "Table with anchor at start of cell",
  true,
  "| [](){ #id1 }Start | End[](){ #id2 } |\n| --- | --- |\n| 123 | 456 |",
  "| [](){#id1}Start | End[](){#id2} |\n| --------------- | ------------- |\n| 123             | 456           |"
)

test_case (
  "Unordered list with anchor line between items",
  true,
  "-   Item one\n[](){#id}\n-   Item two",
  "-   Item one[](){#id}\n-   Item two"
)

test_case (
  "Ordered list with anchor line between items",
  true,
  "1. 第一项\n[](){#id}\n2. 第二项",
  "1.  第一项[](){#id}\n2.  第二项"
)


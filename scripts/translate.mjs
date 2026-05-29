import { readFileSync, writeFileSync } from 'fs'
import { readdirSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const postsDir = resolve(__dirname, '../src/posts')

// Chinese → English tech vocabulary
const DICT = {
  '开发环境': 'Dev Environment',
  '开发': 'Development',
  '环境配置': 'Environment Setup',
  '环境': 'Environment',
  '配置': 'Setup',
  '系统': 'System',
  '下载': 'Download',
  '编译': 'Compilation',
  '安装': 'Install',
  '测试': 'Test',
  '效果展示': 'Result',
  '前言': 'Preface',
  '详细介绍': 'A complete guide to',
  '完整流程': 'complete workflow',
  '常见报错': 'common error fixes',
  '解决方案': 'solutions',
  '使用': 'Using',
  '新建': 'Create',
  '项目': 'Project',
  '代码': 'Code',
  '路径': 'Path',
  '文件夹': 'Folder',
  '版本': 'Version',
  '报错': 'Errors',
  '警告': 'Warnings',
  '解决': 'Fix',
  '添加': 'Add',
  '创建': 'Create',
  '完成': 'Complete',
  '文件': 'File',
  '提供': 'Provide',
  '步骤': 'Step',
  '关键': 'Key',
  '组件': 'Components',
  '代理': 'Proxy',
  '排查': 'Troubleshoot',
  '参考': 'Reference',
  '多核': 'Multi-core',
  '网盘': 'Cloud Drive',
  '链接': 'Link',
  '提取码': 'Extraction Code',
  '邮箱': 'Email',
  '问题': 'Issues',
  '搜索': 'Search',
  '最新': 'Latest',
  '过时': 'Outdated',
  '过程': 'Process',
  '注册': 'Register',
  '账号': 'Account',
  '终端': 'Terminal',
  '展示': 'Display',
  '展示效果': 'Result Display',
}

// Common Chinese → English tag mappings
const TAG_DICT = {
  '环境配置': 'Environment Setup',
  '开发环境': 'Dev Environment',
  '教程': 'Tutorial',
  '入门': 'Getting Started',
  '示例': 'Sample',
  '报错解决': 'Error Fix',
  '编译配置': 'Build Config',
  '图像处理': 'Image Processing',
}

function translateTerm(text) {
  // Keep English/technical terms unchanged
  if (/^[A-Za-z0-9+\-.#_\s/]+$/.test(text.trim()) && text.trim().length > 2) {
    return text.trim()
  }

  // Try exact match first
  if (DICT[text]) return DICT[text]

  // Try longest substring match
  let result = text
  const sorted = Object.entries(DICT).sort((a, b) => b[0].length - a[0].length)
  for (const [cn, en] of sorted) {
    if (result.includes(cn)) {
      result = result.replace(cn, en)
    }
  }
  return result
}

function translateSentence(text) {
  if (!text) return text
  // Don't translate if already English
  if (/^[A-Za-z0-9\s,.;:!?()[\]"'+\-/#@%&*<>=\\]+$/.test(text.trim())) {
    return text.trim()
  }
  // Apply dictionary substitution
  let result = text
  const sorted = Object.entries(DICT).sort((a, b) => b[0].length - a[0].length)
  for (const [cn, en] of sorted) {
    result = result.replaceAll(cn, en)
  }
  return result
}

function translateTags(tags) {
  return tags.map(tag => {
    if (TAG_DICT[tag]) return TAG_DICT[tag]
    if (/^[A-Za-z0-9+#.\-_]+$/.test(tag)) return tag
    return translateTerm(tag)
  })
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return { fields: null, body: content }
  return {
    fields: match[1],
    body: content.slice(match[0].length)
  }
}

function parseFields(fmText) {
  const fields = {}
  let currentKey = null
  let arrayItems = null

  for (const line of fmText.split('\n')) {
    const arrStart = line.match(/^(\w+):\s*\[(.*?)\]$/)
    const arrNoEnd = line.match(/^(\w+):\s*\[(.*)$/)
    const arrCont = line.match(/^\s*(.*?),?\s*\]?$/)
    const kv = line.match(/^(\w+):\s*(.*)/)

    if (arrStart) {
      const items = arrStart[2].split(',').map(s => s.trim()).filter(Boolean)
      fields[arrStart[1]] = items
      currentKey = null
    } else if (arrNoEnd) {
      currentKey = arrNoEnd[1]
      arrayItems = arrNoEnd[2].split(',').map(s => s.trim()).filter(Boolean)
    } else if (currentKey && arrCont) {
      const items = arrCont[1].split(',').map(s => s.trim()).filter(Boolean)
      arrayItems.push(...items)
      if (line.trim().endsWith(']')) {
        fields[currentKey] = arrayItems
        currentKey = null
        arrayItems = null
      }
    } else if (kv) {
      fields[kv[1]] = kv[2].trim()
      currentKey = null
    }
  }
  return fields
}

function buildFields(fields) {
  // Maintain a specific field order
  const order = ['title', 'titleEn', 'date', 'tags', 'tagsEn', 'description', 'descriptionEn', 'editLink']
  const ordered = []
  const remaining = new Set(Object.keys(fields))

  for (const key of order) {
    if (fields[key] !== undefined) {
      const val = fields[key]
      if (Array.isArray(val)) {
        ordered.push(`${key}: [${val.join(', ')}]`)
      } else if (typeof val === 'string' && val.includes('\n')) {
        ordered.push(`${key}: |`)
        val.split('\n').forEach(l => ordered.push(`  ${l}`))
      } else {
        ordered.push(`${key}: ${val}`)
      }
      remaining.delete(key)
    }
  }
  // Remaining fields
  for (const key of remaining) {
    const val = fields[key]
    if (Array.isArray(val)) {
      ordered.push(`${key}: [${val.join(', ')}]`)
    } else {
      ordered.push(`${key}: ${val}`)
    }
  }

  return '---\n' + ordered.join('\n') + '\n---'
}

function processPost(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const { fields: fmText, body } = parseFrontmatter(content)
  if (!fmText) {
    console.log(`  No frontmatter, skipping`)
    return false
  }

  const fields = parseFields(fmText)
  const relPath = filePath.replace(postsDir, '')
  console.log(`\nProcessing: ${relPath}`)

  let modified = false

  // Translate title
  if (!fields.titleEn && fields.title) {
    fields.titleEn = translateSentence(fields.title)
    console.log(`  title: "${fields.title}" → "${fields.titleEn}"`)
    modified = true
  }

  // Translate description
  if (!fields.descriptionEn && fields.description) {
    fields.descriptionEn = translateSentence(fields.description)
    console.log(`  description translated`)
    modified = true
  }

  // Translate tags (keep English tags, translate Chinese ones)
  if ((!fields.tagsEn || fields.tagsEn.length === 0) && fields.tags && fields.tags.length > 0) {
    fields.tagsEn = translateTags(fields.tags)
    console.log(`  tags: [${fields.tags}] → [${fields.tagsEn}]`)
    modified = true
  }

  if (modified) {
    const newFrontmatter = buildFields(fields)
    const newContent = newFrontmatter + '\n' + body
    writeFileSync(filePath, newContent, 'utf-8')
    console.log('  ✓ Updated')
    return true
  } else {
    console.log('  ✓ Already has English fields')
    return false
  }
}

function findMdFiles(dir) {
  const results = []
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findMdFiles(fullPath))
    } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
      results.push(fullPath)
    }
  }
  return results
}

console.log('Blog Post Translator (Local Dictionary)\n')

const files = findMdFiles(postsDir)
console.log(`Found ${files.length} post(s) to process`)

for (const file of files) {
  try {
    processPost(file)
  } catch (e) {
    console.error(`  Error processing ${file}: ${e.message}`)
  }
}

console.log('\nDone!')

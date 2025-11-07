/**
 * 验证 TipTap 编辑器四个核心功能的脚本
 * 
 * 功能包括：
 * 1. 字号 (FontSize)
 * 2. 段落间距 (ParagraphSpacing) 
 * 3. 有序列表 (OrderedList)
 * 4. 无序列表 (BulletList)
 */

// 只在 Node.js 环境中导入这些模块
let createEditor: any = null;
let StarterKit: any = null;
let TextStyle: any = null;
let OrderedList: any = null;
let BulletList: any = null;
let ListItem: any = null;
let FontSize: any = null;
let ParagraphSpacing: any = null;

// 动态导入，避免在浏览器环境中出错
if (typeof window === 'undefined') {
  try {
    const tiptapCore = require('@tiptap/core');
    createEditor = tiptapCore.createEditor;
    StarterKit = require('@tiptap/starter-kit').default;
    TextStyle = require('@tiptap/extension-text-style').TextStyle;
    OrderedList = require('@tiptap/extension-ordered-list').default;
    BulletList = require('@tiptap/extension-bullet-list').default;
    ListItem = require('@tiptap/extension-list-item').default;
    FontSize = require('./FontSize').FontSize;
    ParagraphSpacing = require('./ParagraphSpacing').ParagraphSpacing;
  } catch (error) {
    console.warn('无法在当前环境中加载 TipTap 模块:', error);
  }
}

export interface FeatureTestResult {
  feature: string
  success: boolean
  error?: string
  htmlOutput?: string
}

/**
 * 创建测试编辑器实例
 */
function createTestEditor() {
  if (!createEditor || !StarterKit || !TextStyle || !FontSize || !ParagraphSpacing) {
    throw new Error('TipTap 模块未正确加载，此功能只能在 Node.js 环境中使用');
  }

  const extensions = [
    StarterKit.configure({
      bulletList: false,
      orderedList: false,
      listItem: false,
      paragraph: false,
      heading: { levels: [1, 2, 3, 4, 5, 6] },
    }),
    TextStyle,
    FontSize,
    ParagraphSpacing,
    OrderedList.configure({
      HTMLAttributes: {
        class: 'tiptap-ordered-list',
      },
    }),
    BulletList.configure({
      HTMLAttributes: {
        class: 'tiptap-bullet-list',
      },
    }),
    ListItem.configure({
      HTMLAttributes: {
        class: 'tiptap-list-item',
      },
    }),
  ]

  return createEditor({
    extensions,
    content: '<p>测试内容</p>',
  })
}

/**
 * 测试字号功能
 */
export function testFontSize(): FeatureTestResult {
  try {
    const editor = createTestEditor()
    
    // 选择所有文本
    editor.commands.selectAll()
    
    // 设置字号
    const success = editor.commands.setFontSize('18px')
    const html = editor.getHTML()
    
    // 验证结果
    const hasCorrectFontSize = html.includes('font-size: 18px')
    
    if (success && hasCorrectFontSize) {
      return {
        feature: '字号 (FontSize)',
        success: true,
        htmlOutput: html
      }
    } else {
      return {
        feature: '字号 (FontSize)',
        success: false,
        error: '字号设置失败或HTML输出不正确',
        htmlOutput: html
      }
    }
  } catch (error) {
    return {
      feature: '字号 (FontSize)',
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

/**
 * 测试段落间距功能
 */
export function testParagraphSpacing(): FeatureTestResult {
  try {
    const editor = createTestEditor()
    
    // 设置段落间距
    const success = editor.commands.setParagraphSpacing({
      lineHeight: '1.8',
      marginTop: '16px',
      marginBottom: '12px'
    })
    
    const html = editor.getHTML()
    
    // 验证结果
    const hasLineHeight = html.includes('line-height: 1.8')
    const hasMarginTop = html.includes('margin-top: 16px')
    const hasMarginBottom = html.includes('margin-bottom: 12px')
    
    if (success && hasLineHeight && hasMarginTop && hasMarginBottom) {
      return {
        feature: '段落间距 (ParagraphSpacing)',
        success: true,
        htmlOutput: html
      }
    } else {
      return {
        feature: '段落间距 (ParagraphSpacing)',
        success: false,
        error: '段落间距设置失败或HTML输出不正确',
        htmlOutput: html
      }
    }
  } catch (error) {
    return {
      feature: '段落间距 (ParagraphSpacing)',
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

/**
 * 测试有序列表功能
 */
export function testOrderedList(): FeatureTestResult {
  try {
    const editor = createTestEditor()
    
    // 选择所有文本
    editor.commands.selectAll()
    
    // 切换为有序列表
    const success = editor.commands.toggleOrderedList()
    const html = editor.getHTML()
    
    // 验证结果
    const hasOrderedList = html.includes('<ol')
    const hasListItem = html.includes('<li')
    const hasCorrectClass = html.includes('tiptap-ordered-list')
    
    if (success && hasOrderedList && hasListItem) {
      return {
        feature: '有序列表 (OrderedList)',
        success: true,
        htmlOutput: html
      }
    } else {
      return {
        feature: '有序列表 (OrderedList)',
        success: false,
        error: '有序列表创建失败或HTML输出不正确',
        htmlOutput: html
      }
    }
  } catch (error) {
    return {
      feature: '有序列表 (OrderedList)',
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

/**
 * 测试无序列表功能
 */
export function testBulletList(): FeatureTestResult {
  try {
    const editor = createTestEditor()
    
    // 选择所有文本
    editor.commands.selectAll()
    
    // 切换为无序列表
    const success = editor.commands.toggleBulletList()
    const html = editor.getHTML()
    
    // 验证结果
    const hasBulletList = html.includes('<ul')
    const hasListItem = html.includes('<li')
    const hasCorrectClass = html.includes('tiptap-bullet-list')
    
    if (success && hasBulletList && hasListItem) {
      return {
        feature: '无序列表 (BulletList)',
        success: true,
        htmlOutput: html
      }
    } else {
      return {
        feature: '无序列表 (BulletList)',
        success: false,
        error: '无序列表创建失败或HTML输出不正确',
        htmlOutput: html
      }
    }
  } catch (error) {
    return {
      feature: '无序列表 (BulletList)',
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

/**
 * 运行所有功能测试
 */
export function runAllTests(): FeatureTestResult[] {
  return [
    testFontSize(),
    testParagraphSpacing(),
    testOrderedList(),
    testBulletList()
  ]
}

/**
 * 打印测试结果
 */
export function printTestResults(results: FeatureTestResult[]): void {
  console.log('\n=== TipTap 编辑器功能测试结果 ===\n')
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ 通过' : '❌ 失败'
    console.log(`${index + 1}. ${result.feature}: ${status}`)
    
    if (!result.success && result.error) {
      console.log(`   错误: ${result.error}`)
    }
    
    if (result.htmlOutput) {
      console.log(`   HTML: ${result.htmlOutput}`)
    }
    
    console.log('')
  })
  
  const passedCount = results.filter(r => r.success).length
  const totalCount = results.length
  
  console.log(`总结: ${passedCount}/${totalCount} 个功能测试通过`)
  
  if (passedCount === totalCount) {
    console.log('🎉 所有功能都正常工作！')
  } else {
    console.log('⚠️  部分功能需要修复')
  }
}

/**
 * 验证编辑器扩展是否正确配置
 */
export function verifyEditorConfiguration(): boolean {
  try {
    const editor = createTestEditor()
    
    // 检查所有必需的命令是否存在
    const requiredCommands = [
      'setFontSize',
      'unsetFontSize',
      'setParagraphSpacing',
      'unsetParagraphSpacing',
      'toggleOrderedList',
      'toggleBulletList'
    ]
    
    for (const command of requiredCommands) {
      if (!(command in editor.commands)) {
        console.error(`缺少命令: ${command}`)
        return false
      }
    }
    
    console.log('✅ 编辑器配置验证通过')
    return true
  } catch (error) {
    console.error('❌ 编辑器配置验证失败:', error)
    return false
  }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined' && require.main === module) {
  console.log('开始验证 TipTap 编辑器功能...')
  
  if (verifyEditorConfiguration()) {
    const results = runAllTests()
    printTestResults(results)
  }
}
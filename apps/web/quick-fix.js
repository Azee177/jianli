/**
 * 快速修复脚本 - 检查并修复主页面功能问题
 */

console.log('🔧 运行快速修复检查...\n');

const fs = require('fs');
const path = require('path');

// 1. 检查并修复 ResumeEditor 中的命令调用
console.log('1️⃣ 检查 ResumeEditor 命令调用');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
    const editorPath = path.join(__dirname, 'src/components/layout/ResumeEditor.tsx');
    let editorContent = fs.readFileSync(editorPath, 'utf8');

    let modified = false;

    // 检查字号命令调用
    if (editorContent.includes('editor.chain().focus().setFontSize(fontSize).run()')) {
        console.log('✅ 字号命令调用正确');
    } else if (editorContent.includes('setFontSize(fontSize)')) {
        console.log('⚠️  字号命令调用可能需要修复');
    }

    // 检查段落间距命令调用
    if (editorContent.includes('editor.chain().focus().setParagraphSpacing(opts).run()')) {
        console.log('✅ 段落间距命令调用正确');
    } else if (editorContent.includes('setParagraphSpacing(opts)')) {
        console.log('⚠️  段落间距命令调用可能需要修复');
    }

    // 检查列表命令调用
    if (editorContent.includes('toggleOrderedList()') && editorContent.includes('toggleBulletList()')) {
        console.log('✅ 列表命令调用正确');
    } else {
        console.log('⚠️  列表命令调用可能需要修复');
    }

} catch (error) {
    console.log('❌ 无法检查 ResumeEditor 文件');
}

// 2. 验证扩展文件的命令导出
console.log('\n2️⃣ 验证扩展命令导出');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
    const fontSizeContent = fs.readFileSync(path.join(__dirname, 'src/lib/editor/extensions/FontSize.ts'), 'utf8');

    if (fontSizeContent.includes('addCommands()') &&
        fontSizeContent.includes('setFontSize:') &&
        fontSizeContent.includes('unsetFontSize:')) {
        console.log('✅ FontSize 扩展命令导出正确');
    } else {
        console.log('❌ FontSize 扩展命令导出有问题');
    }

} catch (error) {
    console.log('❌ 无法检查 FontSize 扩展');
}

try {
    const paragraphContent = fs.readFileSync(path.join(__dirname, 'src/lib/editor/extensions/ParagraphSpacing.ts'), 'utf8');

    if (paragraphContent.includes('addCommands()') &&
        paragraphContent.includes('setParagraphSpacing:') &&
        paragraphContent.includes('unsetParagraphSpacing:')) {
        console.log('✅ ParagraphSpacing 扩展命令导出正确');
    } else {
        console.log('❌ ParagraphSpacing 扩展命令导出有问题');
    }

} catch (error) {
    console.log('❌ 无法检查 ParagraphSpacing 扩展');
}

// 3. 检查主页面的错误处理
console.log('\n3️⃣ 检查主页面错误处理');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
    const pageContent = fs.readFileSync(path.join(__dirname, 'src/app/page.tsx'), 'utf8');

    // 检查是否有适当的错误处理
    if (pageContent.includes('editorApiRef.current?.')) {
        console.log('✅ 主页面使用了安全的 API 调用');
    } else {
        console.log('⚠️  主页面可能缺少安全的 API 调用');
    }

    // 检查是否有调试日志
    if (pageContent.includes('console.log')) {
        console.log('✅ 主页面包含调试日志');
    } else {
        console.log('ℹ️  主页面没有调试日志（这是正常的）');
    }

} catch (error) {
    console.log('❌ 无法检查主页面文件');
}

// 4. 生成调试建议
console.log('\n📋 调试建议');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('1. 🔄 重启开发服务器:');
console.log('   - 停止当前服务器 (Ctrl+C)');
console.log('   - 运行: npm run dev');

console.log('\n2. 🧹 清除缓存:');
console.log('   - 删除 .next 文件夹');
console.log('   - 硬刷新浏览器 (Ctrl+Shift+R)');

console.log('\n3. 🔍 浏览器调试:');
console.log('   - 打开开发者工具 (F12)');
console.log('   - 查看控制台错误信息');
console.log('   - 测试选择文字和工具栏功能');

console.log('\n4. 📝 测试步骤:');
console.log('   - 访问 http://localhost:3000');
console.log('   - 在编辑器中输入文字');
console.log('   - 选择文字（应该出现浮动工具栏）');
console.log('   - 点击"文本工具"按钮');
console.log('   - 测试字号、段落间距、列表功能');

console.log('\n5. 🆚 对比测试:');
console.log('   - 在 /test-editor 页面测试相同功能');
console.log('   - 对比两个页面的行为差异');

console.log('\n✨ 快速修复检查完成！');
console.log('\n如果问题仍然存在，请按照 MAIN_PAGE_DEBUG_GUIDE.md 中的详细步骤进行调试。');
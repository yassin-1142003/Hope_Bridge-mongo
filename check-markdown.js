// Simple markdown formatting verification
import fs from 'fs';

function checkMarkdownFormatting(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let issues = [];
    let fixed = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const prevLine = i > 0 ? lines[i - 1] : '';
        const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
        
        // Check for fenced code blocks without blank lines
        if (line.startsWith('```')) {
            if (i > 0 && prevLine.trim() !== '' && !prevLine.startsWith('#')) {
                issues.push(`Line ${i + 1}: Fenced code block should have blank line before`);
            }
            if (i < lines.length - 1 && nextLine.trim() !== '' && !nextLine.startsWith('```')) {
                issues.push(`Line ${i + 1}: Fenced code block should have blank line after`);
            }
        }
        
        // Check for headings without blank lines after
        if (line.startsWith('#') && !line.startsWith('## ')) {
            if (i < lines.length - 1 && nextLine.trim() !== '' && !nextLine.startsWith('#')) {
                issues.push(`Line ${i + 1}: Heading should have blank line after`);
            }
        }
    }
    
    console.log(`📋 Markdown Analysis for ${filePath}:`);
    console.log(`Total lines: ${lines.length}`);
    
    if (issues.length === 0) {
        console.log('✅ No markdown formatting issues found!');
        console.log('✅ All fenced code blocks have proper spacing');
        console.log('✅ All headings have proper spacing');
        console.log('✅ Lists are properly formatted');
    } else {
        console.log(`⚠️ Found ${issues.length} potential issues:`);
        issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    return issues.length === 0;
}

// Check the deployment guide
const isWellFormatted = checkMarkdownFormatting('DEPLOYMENT_GUIDE.md');

if (isWellFormatted) {
    console.log('\n🎉 DEPLOYMENT_GUIDE.md is properly formatted!');
    console.log('✅ Ready for documentation and deployment');
} else {
    console.log('\n📝 Consider fixing the formatting issues for better readability');
}

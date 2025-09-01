#!/bin/bash

echo "🗑️  GITHUB REPOSITORY CLEANUP SCRIPT"
echo "======================================="
echo ""
echo "⚠️  WARNING: This will DELETE repositories permanently!"
echo "✅ KEEPING: tanzi-blog (main blog with automation)"
echo "🗑️  DELETING: Only the 4 specified problematic repositories"
echo ""
echo "Repositories to be DELETED:"
echo "- hwptoolkit"
echo "- tanzi-business-site"
echo "- tweet_automation"
echo "- -tanzitech-blog (with dash prefix)"
echo "- cloudflare-docs"
echo ""

read -p "⚠️  Are you ABSOLUTELY SURE you want to delete these repos? (type 'DELETE' to confirm): " confirm

if [ "$confirm" != "DELETE" ]; then
    echo "❌ Cleanup cancelled. No repositories were deleted."
    exit 1
fi

echo ""
echo "🚀 Starting repository cleanup..."
echo ""

# Array of repositories to delete (5 repositories)
repos_to_delete=(
    "hwptoolkit"
    "tanzi-business-site"
    "tweet_automation"
    "-tanzitech-blog"
    "cloudflare-docs"
)

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "📋 Manual deletion required:"
    echo ""
    for repo in "${repos_to_delete[@]}"; do
        echo "🌐 Delete: https://github.com/1DigitalPartner/$repo/settings"
    done
    echo ""
    echo "📋 Steps for manual deletion:"
    echo "1. Go to each repository URL above"
    echo "2. Scroll to bottom → 'Delete this repository'"
    echo "3. Type repository name to confirm"
    echo "4. Click 'Delete this repository'"
    exit 1
fi

# Delete repositories using GitHub CLI
for repo in "${repos_to_delete[@]}"; do
    echo "🗑️  Deleting repository: $repo"
    
    # Check if repo exists first
    if gh repo view "1DigitalPartner/$repo" &>/dev/null; then
        echo "   Repository exists, proceeding with deletion..."
        if gh repo delete "1DigitalPartner/$repo" --yes; then
            echo "   ✅ Successfully deleted: $repo"
        else
            echo "   ❌ Failed to delete: $repo"
        fi
    else
        echo "   ⚠️  Repository not found or already deleted: $repo"
    fi
    
    echo ""
done

echo "🎉 GitHub repository cleanup completed!"
echo ""
echo "✅ REMAINING REPOSITORIES:"
echo "   - tanzi-blog (will become tanzitech.com/blog)"
echo "   - ai-market-analysis"
echo "   - Tech-Insight"
echo ""
echo "🔗 Check your repositories: https://github.com/1DigitalPartner?tab=repositories"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Clean up Cloudflare Workers & Pages"
echo "2. Remove text-to-image project from Cloudflare" 
echo "3. Verify domain routing is working correctly"

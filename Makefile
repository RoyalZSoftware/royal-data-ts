release:
	git diff --quiet -- ':(exclude)Makefile' ':(exclude)CHANGELOG.md' ':(exclude)tools/*' || (echo "You have uncommited changes" && exit 1)
	npm run test
	node tools/apply-latest-version-from-changelog-to-package-json.js
	npm run build
	export TAG=`cat package.json | jq -r .version` && echo $$TAG && git add CHANGELOG.md package.json package-lock.json && git commit -m "chore(changelog): $$TAG" && git tag $$TAG
	git push
	git push --tags
	export TAG=`cat package.json | jq -r .version` && gh release create --title "v$$TAG" $$TAG -F CHANGELOG.md
	npm publish
release:
	git diff --quiet -- ':(exclude)Makefile' ':(exclude)CHANGELOG.md' ':(exclude)tools/*' || (echo "You have uncommited changes" && exit 1)
	node tools/apply-latest-version-from-changelog-to-package-json.js
	export TAG=`cat package.json | jq -r .version` && echo $$TAG && git add CHANGELOG.md && git commit -m 'chore(changelog): $$TAG' && git tag $$TAG
	git push
	git push --tags
	npm publish
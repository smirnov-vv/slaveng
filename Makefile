# Эта команда полезна при первом клонировании репозитория (или после удаления node_modules)
install:
	npm ci

check:
	npm run lint
	npm run check-format

fix:
	npm run lint:fix
	npm run format

# Push to slaveng repository
push:
	git push origin main

# Pull from slaveng repository
pull:
	git pull --rebase origin main

devstart:
	npm run dev

start:
	npm run start

compose:
	docker compose build
	docker compose push

ssh:
	ssh -t root@45.67.57.2 'cd slaveng ; bash -l'

climate:
	codeclimate analyze server

grep:
	grep -r $(what) . --exclude-dir=client --exclude-dir=dev.sqlite3 --exclude-dir=node_modules/ \
	--exclude-dir=.git --exclude=package-lock.json \
	--exclude-dir=__tests__ --exclude-dir=coverage --exclude-dir=codeclimate-master 
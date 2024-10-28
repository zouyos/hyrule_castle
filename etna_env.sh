npm init -y 
npm install -g typescript@5.1.6 
npm install --save-dev @types/node@20.0.0 
npm install git+https://github.com/etna-alternance/ETNA-Linter.git 
cp ./node_modules/etna-eslint/.eslintrc.json . 
cp ./node_modules/etna-eslint/tsconfig.json . 
echo "alias eslint='./node_modules/.bin/eslint'" 
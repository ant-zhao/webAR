const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator'); // JS混淆丑化

// 引入插件
const HtmlWebpackPlugin = require('html-webpack-plugin');  //打包html文件
const CleanWebpackPlugin = require('clean-webpack-plugin');  //清除上一次打包生成的带有hash的文件
const CopyWebpackPlugin = require('copy-webpack-plugin'); //拷贝静态资源
const UglifyJSPlugin = require('uglifyjs-webpack-plugin'); //压缩JS文件
const webpack = require('webpack');

//less全局配置
const globalLessVars = require('./src/common/global_less_vars');

// 多入口管理文件
const entryJSON = require('./config/entry.js');


// 因为多入口，所以要多个HtmlWebpackPlugin，每个只能管一个入口
let plugins = entryJSON.map(page => {
    return new HtmlWebpackPlugin({
        filename: path.resolve(__dirname, `./html/${page.url}.html`),
        template: path.resolve(__dirname, `./src/${page.url}.html`),
        chunks: [page.url, 'foo'], // 实现多入口的核心，决定自己加载哪个js文件，这里的 page.url 指的是 entry 对象的 key 所对应的入口打包出来的js文件
        hash: true, // 为静态资源生成hash值
        minify: false,   // 压缩，如果启用这个的话，需要使用html-minifier，不然会直接报错
        xhtml: true,    // 自闭标签
    })
})


// 入口管理
let entry = {
    // 引入jQuery，这个是为了配合 webpack.optimize.CommonsChunkPlugin 这个插件使用。
}

entryJSON.map(page => {
    entry[page.url] = path.resolve(__dirname, `./src/js/${page.url}.js`)
})



module.exports = {
    entry:entry, 
    devtool: 'false',
	output:{
	    path:__dirname+ "/html/js",
	    filename:"[name].[chunkhash].js"
	},
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
            { test: /\.css$/,use: ['style-loader','css-loader']},
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            root: path.resolve(__dirname, './src/static'),   // url里，以 / 开头的路径，去找src/static文件夹
                            minimize: true, // 压缩css代码
                            // sourceMap: true,    // sourceMap，默认关闭
                            alias: {
                                '@': path.resolve(__dirname, './src/img') // '~@/logo.png' 这种写法，会去找src/img/logo.png这个文件
                            }
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            config: {
                                path: './config'
                            },
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'less-loader',   // compiles Less to CSS
                        options: {
                            globalVars: globalLessVars
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|jpe?g|gif|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: '[name].[ext]',
                            /*outputPath: function (fileName) {
                                return '../img/' + fileName    // 后面要拼上这个 fileName 才行
                            },*/
                        	outputPath: '../img',
                        	publicPath: './img'
                        }
                    },
                    {	//压缩图片要在file-loader之后使用
		            	loader:'image-webpack-loader',
	                    options:{
	                        bypassOnDebug: true
	                    }
		            }

                ]
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-withimg-loader',
                    },
                    {
                    	loader: 'html-loader',
                    	options: {
                    		attrs: ['img:src', 'img:data-src', 'audio:src'],//html图片输出
                    		minimize:true
	                    }
                    }
                ]
            }
        ]
    },
    // 将插件添加到webpack中
    // 如果还有其他插件，将两个数组合到一起就行了
    plugins: ([
        new CleanWebpackPlugin(path.resolve(__dirname, './html'), {
            root: path.resolve(__dirname, './'),
            verbose: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "foo", // 这个对应的是 entry 的 key
            minChunks: 2
        }),
        /*new UglifyJSPlugin({
        	cache: true,
            parallel: true,
            sourceMap: true
        }),*/
        new CopyWebpackPlugin([
        	{
        		from:__dirname+'/src/model',
        		to:__dirname+'/html/model'
        	},
        	{
        		from:__dirname+'/src/js/assets',
        		to:__dirname+'/html/js/assets'
        	},
        	{
        		from:__dirname+'/src/resource',
        		to:__dirname+'/html/resource'
        	},
        	{
        		from:__dirname+'/src/textures',
        		to:__dirname+'/html/textures'
        	}
        ])
    ].concat(plugins))
};
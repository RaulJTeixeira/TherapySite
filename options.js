let models 	= require( appRoot + '/models/');

let _optionsPromise = models.options
	.find()
	.exec()
	.then(( opts )=>{
		for( var i = 0, l = opts.length; i < l; i++ )
			opts[i].value = JSON.parse( opts[i].value );

		global.options = options;

		return Promise.resolve( opts );
	});

function getOption( name ) {
	return _optionsPromise.then(()=>{
		return options.find(( option )=>{
			return option.name == name;
		})
	});
}

function getOptions() {
	return _optionsPromise.then(()=>{
		return Promise.resolve( global.options );
	});
}

function saveOption( name, value, autoLoad ) {
	if(
			autoLoad === undefined
		&& 	autoLoad === null
	) autoLoad = false;

	let option = manifest.options.find(( option )=>{
		return option.name == name;
	});

	if( !option ) {
		option = {
			name: name,
			value: value,
			autoLoad: autoLoad
		};

		manifest.options.push(option);
	}

	option.value 	= value;
	option.autoLoad = autoLoad;

	return models
		.options
		.findOneAndUpdate(
			{ name: name },
			{ name: name, value: JSON.stringify( value ), autoLoad: autoLoad },
			{ upsert: true, new: true }
		).exec().then(()=>{
			return getOptions().then(( options )=>{
				global.options = options;
			});
		});
}

module.exports = {
	getOption: getOption,
	getOptions: getOptions,
	saveOption: saveOption
};







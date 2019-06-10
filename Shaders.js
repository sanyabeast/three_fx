import shadersJSON from "txt!../../../res/shaders.json";
import Helpers from "Plot3/Utils/Helpers";
import SlimShader from "Plot3/Common/SlimShader";

let shadersData = JSON.parse(shadersJSON);
let shaders = {};

Helpers.forEach(shadersData.content, function (data, name) {
	name = name.replace(/::/gm, ".");
	name = name.replace(/^res.shaders./, "");
	name = (name.match(/vert./gm)) ? ("vert." + name.replace(/vert./gm, "")): name;
	name = (name.match(/frag./gm)) ? ("frag." + name.replace(/frag./gm, "")): name;

	shaders[name] = data;
});

Helpers.forEach(shaders, function(shaderXML, name){
	let type = name.indexOf("vert.") == 0 ? "vertex" : "fragment";

	if (!(shaders[name] instanceof SlimShader)){
		shaders[name] = new SlimShader(shaders, type, shaderXML);			
	}

});

export default shaders;

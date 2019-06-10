/**
 * @author alteredq / http://alteredqualia.com/
 */


import CopyShader from "three_fx/shaders/CopyShader"
import ShaderPass from "three_fx/passes/ShaderPass"
import ClearMaskPass from "three_fx/passes/ClearMaskPass"
import MaskPass from "three_fx/passes/MaskPass"
import { forEach } from "lodash"

class EffectComposer {

	constructor ( renderer, renderTarget ) {

		this.renderer = renderer;

		if ( renderTarget === undefined ) {

			var parameters = this.parameters = {
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				format: THREE.RGBAFormat,
				stencilBuffer: false,
				size: new THREE.Vector2( 0, 0 )
				// antialias: true
			};

			var size = this.parameters.size = renderer.getDrawingBufferSize( this.parameters.size );
			renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, parameters );
			renderTarget.texture.name = 'EffectComposer.rt1';

		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();
		this.renderTarget2.texture.name = 'EffectComposer.rt2';

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		this.passes = [];

		// dependencies

		if ( CopyShader === undefined ) {

			console.error( 'THREE.EffectComposer relies on CopyShader' );

		}

		if ( ShaderPass === undefined ) {

			console.error( 'THREE.EffectComposer relies on ShaderPass' );

		}

		this.copyPass = new ShaderPass( CopyShader );

		this._previousFrameTime = Date.now();

	}

	setRenderer (renderer) {
		this.renderer = renderer
	}

	swapBuffers () {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	}

	addPass ( pass ) {

		this.passes.push( pass );

		var size = this.parameters.size = this.renderer.getDrawingBufferSize( this.parameters.size );
		pass.setSize( size.width, size.height );

		forEach(this.passes, (pass, index)=>{
			pass.renderToScreen = false
		})

		this.passes[this.passes.length - 1].renderToScreen = true


	}

	insertPass ( pass, index ) {

		this.passes.splice( index, 0, pass );

	}

	render ( deltaTime ) {

		// deltaTime value is in seconds

		if ( deltaTime === undefined ) {

			deltaTime = ( Date.now() - this._previousFrameTime ) * 0.001;

		}

		this._previousFrameTime = Date.now();

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.context;

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( MaskPass !== undefined ) {

				if ( pass instanceof MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof ClearMaskPass ) {

					maskActive = false;

				}

			}

		}

	}


	onAcquaintance (renderer, shared) {
		let shapeMaster = shared.shapeMaster
		console.log(renderer, shared)
	}

	reset ( renderTarget ) {

		if ( renderTarget === undefined ) {

			var size = this.renderer.getDrawingBufferSize();

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( size.width, size.height );

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	}

	setSize ( width, height ) {

		this.renderTarget1.setSize( width, height );
		this.renderTarget2.setSize( width, height );

		for ( var i = 0; i < this.passes.length; i ++ ) {

			this.passes[ i ].setSize( width, height );

		}

	}


}

export default EffectComposer
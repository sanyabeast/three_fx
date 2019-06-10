 

import Pass from "three_fx/Pass"



class ClearMaskPass extends Pass {
	constructor () {
		super()
		this.needsSwap = false;
	}

	render ( renderer, writeBuffer, readBuffer, delta, maskActive ) {
        renderer.state.buffers.stencil.setTest( false );
    }
}

export default ClearMaskPass
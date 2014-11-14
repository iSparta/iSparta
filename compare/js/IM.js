(function (global) {
	'use strict';
	/**
	 * bDebug is a private flag to know if we want to know what's happening.
	 * @private
	 * @type Boolean
	 */
	var bDebug = false,
		/**
		 * oContainerDiff is a container where create the canvas element with the result.
		 * @private
		 * @type Object
		 */
			oContainerDiff = null,
		/**
		 *  nMinPercentage is the tolerance to set a difference between images as ok.
		 *  @private
		 *  @type Number
		 */
			nMinPercentage = 100,
		/**
		 * bAsynchronous is a private flag to know if we want to execute the comparison using asynchronous mode or not.
		 * @private
		 * @type Boolean
		 */
			bAsynchronous = false,
		/**
		 * Number of image that are loaded not important to know if are loaded or with error.
		 * @private
		 * @type Number
		 */
			nImagesLoaded = 0,
		/**
		 * Array of canvas that are created dynamically.
		 * @private
		 * @type Array
		 */
			aCanvas = [],
		/**
		 * fpLoop is a method that will save the asynchronous or not loop type
		 * @private
		 * @type Function
		 */
			fpLoop = loop,
		/**
		 * proxyFloat is a proxy where save the parseFloat to use in parseFloat in local
		 */
			proxyFloat = window.parseFloat;

	/**
	 * parseFloat to return
	 * @param number
	 */
	function parseFloat(number) {
		var nDecimals = 4,
			stringNumber = number.toString(),
			decimalTypes = [".",","],
			lastDec, posFinal, numberMore, result, decimalType, decimals, pos;

		for (var i = 0; i < decimalTypes.length; i++) {
			pos = stringNumber.indexOf(decimalTypes[i]);
			if (pos != -1) {
				decimalType = decimalTypes[i];
				break;
			}
		}

		decimals = (stringNumber.length - 1) - pos;
		if (typeof nDecimals != "undefined") {
			decimals = nDecimals;
		}
		posFinal = pos + (decimals + 1);
		if (pos != -1) {
			lastDec = stringNumber.substr(posFinal, 1);
			stringNumber = stringNumber.substr(0, posFinal);
			if (lastDec >= 5) {
				numberMore = stringNumber.substr(stringNumber.length - 1, 1);
				if (numberMore == decimalType) {
					stringNumber = (stringNumber.substr(0, stringNumber.length - 1) * 1) + 1;
				} else {
					stringNumber = stringNumber.substr(0, stringNumber.length - 1) + ((numberMore * 1) + 1);
				}

			}
		}
		result = proxyFloat(stringNumber);
		return result;
	}

	/**
	 * loopWithoutBlocking is a function to process items in asynchronous mode to avoid the environment to be freeze.
	 * @private
	 * @param aItems {Array} Items array to traverse.
	 * @param fpProcess {Function} Callback to execute on each iteration.
	 * @param fpFinish {Function} Callback to execute when all the items are traversed.
	 */
	function loopWithoutBlocking(aItems, fpProcess, fpFinish) {
		var aCopy = aItems.concat();
		var nIndex = aItems.length - 1;
		var nStart = +new Date();
		setTimeout(function recursive() {
			do {
				nIndex--;
				if (fpProcess(aCopy.shift(), nIndex) === false) {
					return;
				}
			} while (aCopy.length > 0 && (+new Date() - nStart < 50));

			if (aCopy.length > 0) {
				setTimeout(recursive, 25);
			} else {
				fpFinish(aItems);
			}
		}, 25);
	}

	/**
	 * loop is a function to process items.
	 * @private
	 * @param aItems {Array} Items array to traverse.
	 * @param fpProcess {Function} Callback to execute on each iteration.
	 * @param fpFinish {Function} Callback to execute when all the items are traversed.
	 */
	function loop(aItems, fpProcess, fpFinish) {
		var aCopy = aItems.concat();
		var nIndex = aItems.length ;
		var oItem = null;

		while (Boolean(oItem = aCopy.shift())) {
			//console.log(oItem)
			nIndex--;

			if (fpProcess(oItem, nIndex) === false) {

				return;
			}
		}
		fpFinish(aItems);
	}

	/**
	 * compare is the function that starts the comparing of image data.
	 * @param aCanvas {Array} Canvas items to execute the compare of image data.
	 * @param fpSuccess {Function} Callback to execute if all the images are equals in pixel level.
	 * @param fpFail {Function} Callback to execute if any of the images is different in pixel level.
	 */
	function compareWithoutCreate(aCanvas, fpSuccess, fpFail, nStart) {
		var sLastData = null,
			oLastImageData = null,
			nElapsedTime = undefined,
			nPercentageDiff = undefined,
			oDiffObject = null,
			oDiffCanvas = null;
		if (bDebug && typeof nStart === "undefined") {
			nStart = +new Date();
		}

		fpLoop(aCanvas, function (oCanvas, nIndex) {
			var oContext = oCanvas.getContext("2d"),
				aCanvasData = oContext.getImageData(0, 0, oCanvas.width, oCanvas.height),
				sData = JSON.stringify([].slice.call(aCanvasData.data));
			if (sLastData !== null) {
				//console.log(oCanvas)
				if (sLastData.localeCompare(sData) !== 0) {

					oDiffObject = diff(oCanvas.width, oCanvas.height, aCanvasData, oLastImageData);

					nPercentageDiff = oDiffObject.percentage;
					oDiffCanvas = oDiffObject.canvas;
					if (nPercentageDiff >= nMinPercentage)
					{
						return true;
					}
					if (oContainerDiff) {
						oContainerDiff.appendChild(oDiffCanvas);
					}
					oCanvas.className = "fail";
					if (bDebug) {
						nElapsedTime = (+new Date() - nStart);
					}
					fpFail(oCanvas, nElapsedTime, nPercentageDiff);
					return false;
				}
			}
			oLastImageData = aCanvasData;
			sLastData = sData;
		}, function (aCanvas) {
			if (bDebug) {
				nElapsedTime = (+new Date() - nStart);
			}
			fpSuccess(aCanvas, nElapsedTime, nPercentageDiff);
		});
	}

	function diff(nWidth, nHeight, aDataImage, aLastDataImage) {
		var aData = aDataImage.data,
			aLastData = aLastDataImage.data,
			nLenPixels = 0,
			nDiffPixels = 0,
			nDiffPercentage = 0,
			oCanvas = document.createElement("canvas"),
			oContext = oCanvas.getContext("2d"),
			oDataImage = oContext.createImageData(nWidth, nHeight),
			aCreatedDataImage = oDataImage.data,
			nData = 0,
			nRow = 0,
			nColumn = 0,
			nX = 0,
			nY = 0,
			nLenData = aCreatedDataImage.length,
			nRed, nGreen, nBlue, nAlpha, nLastRed, nLastGreen, nLastBlue, nLastAlpha;
		oCanvas.width = nWidth;
		oCanvas.height = nHeight;
		oCanvas.style.border = "#000 1px solid";

		for (nData = nLenData - 1; nData > 0; nData = nData - 4) {
			aCreatedDataImage[nData] = 255;
		}
		nLenPixels = aDataImage.height * aDataImage.width;
		for (nRow = aDataImage.height; nRow--;) {
			for (nColumn = aDataImage.width; nColumn--;) {
				nX = 4 * (nRow * nWidth + nColumn);
				nY = 4 * (nRow * aDataImage.width + nColumn);
				nRed = aData[nY + 0];
				nGreen = aData[nY + 1];
				nBlue = aData[nY + 2];
				nAlpha = aData[nY + 3];
				nLastRed = aLastData[nY + 0];
				nLastGreen = aLastData[nY + 1];
				nLastBlue = aLastData[nY + 2];
				nLastAlpha = aLastData[nY + 3];

				if (nRed === nLastRed && nGreen === nLastGreen && nBlue === nLastBlue && nAlpha === nLastAlpha) {
					aCreatedDataImage[nX + 0] = Math.abs(nRed - nLastRed); // r
					aCreatedDataImage[nX + 1] = Math.abs(nGreen - nLastGreen); // g
					aCreatedDataImage[nX + 2] = Math.abs(nBlue - nLastBlue); // b
					aCreatedDataImage[nX + 3] = Math.abs(nAlpha - nLastAlpha); // a
				} else {
					nDiffPixels++;
					aCreatedDataImage[nX + 0] = aData[nY + 0]; // r
					aCreatedDataImage[nX + 1] = aData[nY + 1]; // g
					aCreatedDataImage[nX + 2] = aData[nY + 2]; // b
					aCreatedDataImage[nX + 3] = aData[nY + 3]; // a
				}

			}
		}

		oContext.putImageData(oDataImage, 0, 0);
		nDiffPercentage = Math.abs((((nDiffPixels - nLenPixels) / nLenPixels) * 100));
		return {
			percentage: parseFloat(nDiffPercentage),
			canvas: oCanvas
		};
	}

	/**
	 * createAndCompare creates canvas in oContainer and adding images to these canvas, then compare it
	 * @private
	 * @param oContainer {Object} Dom element that will contain all the canvas
	 * @param aImages {Array} Array of objects that will represent images (
	 * @param fpSuccess
	 * @param fpFail
	 */
	function createAndCompare(oContainer, aImages, fpSuccess, fpFail) {
		aCanvas = [];
		if (bDebug) {
			var nStart = +new Date();
		}

		fpLoop(aImages, function (oImageConfig, nIndex) {
			var oCanvas, oContext, oImage;
			oCanvas = document.createElement("canvas");
			oCanvas.id = "canvasCompare_" + nIndex;
			aCanvas.push(oCanvas);

			oCanvas.width = oImageConfig.width;
			oCanvas.height = oImageConfig.height;
			oContainer.appendChild(oCanvas);
			oContext = oCanvas.getContext("2d");
			oImage = new Image();

			oImage.onload = function() {
				nImagesLoaded++;
				//console.log(oImage)
				oContext.drawImage(oImage, 0, 0);
			};
			oImage.onerror = function() {
				nImagesLoaded++;
			};
			
			oImage.src = oImageConfig.src;
		}, function finishCallback(aImages) {
			
			if (nImagesLoaded < aImages.length) {
			//console.log(aImages.length)
			//if (aImages.length<2) {
				
				setTimeout(function() {
					finishCallback(aImages);
				}, 25);
			} else {
				//console.log(aImages.length)
				compareWithoutCreate(aCanvas, fpSuccess, fpFail, nStart);
			}
		});
	}

	/**
	 * ImageToCompare is a JSON helper to create new images objects to be compared.
	 * @param sUrl {String} represents the src of the image to be loaded.
	 * @param nWidth
	 * @param nHeight
	 */
	var ImageToCompare = function(sUrl, nWidth, nHeight) {
		this.src = sUrl + (sUrl.indexOf("?") === -1 ? "?" : "&") + (+new Date());
		this.width = nWidth;
		this.height = nHeight;
	};

	/**
	 * IM (Image Match) is a class to compare images using canvas at pixel level
	 * @class Represents an Image Match
	 * @constructor
	 * @name IM
	 * @author Tomas Corral Casas
	 * @version 1.0
	 */
	function IM() {
	}

	/**
	 * setDebug is the method to set the debug to allow check the incorrect canvas and log how many time it tooks.
	 * @member IM.prototype
	 * @param bLocalDebug
	 * @returns {Boolean} bDebug
	 */
	IM.prototype.setDebug = function setDebug(bLocalDebug) {
		bDebug = bLocalDebug;
		return bDebug;
	};
	/**
	 * Change the loop type to and from asynchronous.
	 * @member IM.prototype
	 * @param bLocalAsynchronous
	 * @returns {Boolean} bLocalAsynchronous
	 */
	IM.prototype.setAsynchronous = function setAsynchronous(bLocalAsynchronous) {
		bAsynchronous = bLocalAsynchronous;
		fpLoop = bAsynchronous ? loopWithoutBlocking : loop;
		return bLocalAsynchronous;
	};
	/**
	 * showDiffInCanvas is the method that sets the diff mode to create a canvas with the difference
	 * @member IM.prototype
	 * @param {Object} oLocalContainerDiff
	 * @returns {Object} Element where put the result canvas
	 */
	IM.prototype.showDiffInCanvas = function showDiffInCanvas(oLocalContainerDiff) {
		oContainerDiff = oLocalContainerDiff;
		return oContainerDiff;
	};
	/**
	 * setTolerance must be used if you want to check if the match you want is correct.
	 * It is important to assign a tolerance of difference between images.
	 * If the image has a difference lower than nMinPercentage the image will be treated as ok.
	 * @member IM.prototype
	 * @param {Number} nMinPercentage
	 */
	IM.prototype.setTolerance = function percentageDiff(nMinPercent) {
		nMinPercentage = nMinPercent;
		return nMinPercentage;
	};
	IM.prototype.reset = function reset() {
		nImagesLoaded=0;
	};
	/**
	 * Compare is the method that change the behaviour if it's needed to create canvas or not.
	 * @member IM.prototype
	 * @param oContainer/aCanvas
	 * @param aElements/fpSuccess
	 * @param fpSuccess/fpFail
	 * @param fpFail
	 */
	IM.prototype.compare = function(oContainer, aElements, fpSuccess, fpFail) {
		if (!oContainer.nodeType) {
			compareWithoutCreate.apply(this, arguments);

		} else {
			createAndCompare.apply(this, arguments);

		}
	};
	/**
	 * Image is a reference to ImageToCompare.
	 * @member IM.prototype
	 */
	IM.prototype.image = ImageToCompare;
	global.IM = new IM();
}(window));
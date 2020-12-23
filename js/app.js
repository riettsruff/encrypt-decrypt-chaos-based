"use strict";

const $ = document.querySelector.bind(document);

const MAX_ITERATION = 200;
const X0 = new Decimal("0.880000000000000");

let iteration = -1;

let generateKeyMap = (xi, fx, f1x, keyMap = []) => {
	let _fx = xi ? xi.pow(2).times(8).minus(xi).add(1) : 0;
	let _f1x = xi ? xi.times(16).minus(1) : 0;
	let _xi = xi ? xi.minus(_fx.dividedBy(_f1x)) : X0;

	if(++iteration > MAX_ITERATION) return keyMap;

	if(iteration === 0) {
		return generateKeyMap(_xi);
	} else {
		let keyRow = [];
		let indexOfDot = _xi.toString().indexOf(".");
		let xiFixed15 = _xi.toFixed(15);

		let item = xiFixed15.substring(indexOfDot + 1, xiFixed15.length).split("");

		for(let i = 0; i < 15; i += 3) {
			let keyStr = "";
			
			for(let j = 0; j < 3; ++j) keyStr += item[i + j];

			keyRow.push(keyStr);
		}

		return generateKeyMap(_xi, _fx, _f1x, [...keyMap, keyRow]);
	}
};

const KEY_MAP = generateKeyMap();

const ENCRYPT_PLAINTEXT_INPUT = $("#encrypt-plaintext-input");
const ENCRYPT_KEY_INPUT = $("#encrypt-key-input");
const ENCRYPT_SUBMIT_BUTTON = $("#encrypt-submit-button");
const DECRYPT_CIPHERTEXT_INPUT = $("#decrypt-ciphertext-input");
const DECRYPT_KEY_INPUT = $("#decrypt-key-input");
const DECRYPT_SUBMIT_BUTTON = $("#decrypt-submit-button");
const OUTPUT_WRAPPER = $("#output-wrapper");

let toggleOutput = (text, outputWrapper) => {
	outputWrapper.classList.remove("active");
	
	setTimeout(() => {
		outputWrapper.innerHTML = `<span id="output-text">${text}</span>`;
		outputWrapper.classList.add("active");
	}, 500);
};

let crypto = (type, data) => {
	let pi, ci, ki, ascii;
	let output = "";

	switch(type) {
		case "ENCRYPT":
			for(let i = 0; i < data.text.length; ++i) {
				pi = data.text.charCodeAt(i);
				ki = +KEY_MAP[i % KEY_MAP.length][+data.key - 1] % 256;
				ascii = (pi + ki) % 256;

				output += ascii.toString(16).padStart(2, "0");
			}
		break;
		case "DECRYPT":
			let asciiArr = [];

			for(let i = 0; i < data.text.length; i += 2) {
				asciiArr.push(String.fromCharCode(parseInt(data.text.substr(i, 2), 16)));
			}

			for(let i = 0; i < asciiArr.length; ++i) {
				ci = asciiArr[i].charCodeAt(0);
				ki = +KEY_MAP[i % KEY_MAP.length][+data.key - 1] % 256;
				ascii = (ci < ki ? (ci + 256 - ki) : (ci - ki)) % 256;

				output += String.fromCharCode(ascii);
			}
		break;
	}

	toggleOutput(output, OUTPUT_WRAPPER);
};

ENCRYPT_SUBMIT_BUTTON.addEventListener("click", () => {
	if(+ENCRYPT_KEY_INPUT.value < 1 || +ENCRYPT_KEY_INPUT.value > 5) return;
	crypto("ENCRYPT", { text: ENCRYPT_PLAINTEXT_INPUT.value, key: ENCRYPT_KEY_INPUT.value });
});

DECRYPT_SUBMIT_BUTTON.addEventListener("click", () => {
	if(+DECRYPT_KEY_INPUT.value < 1 || +DECRYPT_KEY_INPUT.value > 5) return;
	crypto("DECRYPT", { text: DECRYPT_CIPHERTEXT_INPUT.value, key: DECRYPT_KEY_INPUT.value });
});

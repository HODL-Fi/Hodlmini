const CONSONANTS = ["b","c","d","f","g","h","j","k","l","m","n","p","r","s","t","v","w","z"];
const VOWELS = ["a","e","i","o","u"];

// Simple deterministic hash (djb2-xor variant)
function hashString(input: string): number {
	let h = 5381;
	for (let i = 0; i < input.length; i++) h = ((h << 5) + h) ^ input.charCodeAt(i);
	return h >>> 0;
}

export type HandleStyle = "shortHex" | "base36" | "syllables";

export function generateHandleFromUserId(
	userId: string,
	style: HandleStyle = "shortHex"
): string {
	const h = hashString(userId);

	let core: string;
	if (style === "shortHex") {
		core = h.toString(16).padStart(8, "0").slice(0, 6); // e.g. 4f3a9c
	} else if (style === "base36") {
		core = h.toString(36).slice(0, 5); // e.g. k9x2q
	} else {
		// 3 pronounceable syllables + 2-digit checksum
		const pick = (arr: string[], n: number) => arr[n % arr.length];
		const s1 = pick(CONSONANTS, h);
		const v1 = pick(VOWELS, h >> 5);
		const s2 = pick(CONSONANTS, h >> 9);
		const v2 = pick(VOWELS, h >> 13);
		const s3 = pick(CONSONANTS, h >> 17);
		const v3 = pick(VOWELS, h >> 21);
		const chk = String(h % 100).padStart(2, "0");
		core = `${s1}${v1}${s2}${v2}${s3}${v3}-${chk}`; // e.g. zavafo-27
	}

	return `User-${core}`;
}



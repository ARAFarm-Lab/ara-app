const toTitleCase = (sentence: string): string => {
    return sentence.split(' ')
        .map(word => {
            if (word.length <= 3) return word
            return word.replace(/\b\w/g, (s: string) => s.toUpperCase())
        })
        .join(' ')
}

const snakeToReadableCase = (str: string): string => {
    return toTitleCase(str.replace(/_/g, " "))
}

export default {
    toTitleCase,
    snakeToReadableCase
}
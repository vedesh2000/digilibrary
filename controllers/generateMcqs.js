const natural = require('natural');
function generateMCQs(text, numQuestions) {
    // Tokenize the text into sentences
    const tokenizer = new natural.SentenceTokenizer();
    const sentences = tokenizer.tokenize(text);
  
    // Generate MCQs
    const mcqs = [];
    const stemGenerator = new natural.BayesClassifier();
    const answerGenerator = new natural.BayesClassifier();
  
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
  
      // Generate stems (questions without options)
      stemGenerator.addDocument(sentence, sentence);
      const stem = stemGenerator.classify(sentence);
  
      // Generate answer options
      answerGenerator.addDocument(sentence, sentence);
      const options = answerGenerator.getClassifications(sentence)
        .map(classification => classification.label);
  
      mcqs.push({
        stem: stem,
        options: options
      });
    }
  
    // Shuffle and select a specified number of MCQs
    const shuffledMCQs = natural.Shuffle(mcqs);
    return shuffledMCQs.slice(0, numQuestions);
  }

  module.exports = generateMCQs
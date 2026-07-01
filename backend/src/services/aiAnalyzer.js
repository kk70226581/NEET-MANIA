/**
 * AI Analysis Service
 * Provides AI-powered performance analysis and recommendations
 */

const { getGeminiText } = require('./geminiClient');

class AIAnalyzer {
  /**
   * Generate performance analysis
   * @param {Object} testAttempt - Test attempt data
   * @returns {Promise<Object>} Analysis report
   */
  static async generatePerformanceAnalysis(testAttempt) {
    try {
      const analysisData = this.prepareAnalysisData(testAttempt);

      const prompt = `You are an expert NEET mentor. Analyze this student's test performance and provide actionable insights.

Student Performance Data:
${JSON.stringify(analysisData, null, 2)}

Please provide:
1. Overall performance summary (2-3 sentences)
2. Subject-wise strengths and weaknesses (1-2 sentences each)
3. Top 3 chapters to focus on (priority order)
4. Study recommendations for next 7 days (5 specific actions)
5. Estimated NEET rank range (based on performance)

Format your response as structured points.`;

      const analysis = await getGeminiText({
        systemInstruction: 'You are an expert NEET preparation mentor. Provide practical, encouraging, and actionable analysis based on student performance data.',
        prompt,
        maxOutputTokens: 1200,
        temperature: 0.3
      });

      return {
        analysis,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Analysis Generation Error:', error);
      return {
        analysis: 'Unable to generate analysis at this moment.',
        error: error.message
      };
    }
  }

  /**
   * Generate personalized study plan
   * @param {Object} studentProfile - Student's profile and performance data
   * @returns {Promise<Object>} Personalized study plan
   */
  static async generateStudyPlan(studentProfile) {
    try {
      const prompt = `Create a detailed 7-day personalized study plan for a NEET student.

Student Profile:
- Weak Chapters: ${studentProfile.weakChapters?.join(', ') || 'None identified'}
- Strong Chapters: ${studentProfile.strongChapters?.join(', ') || 'None identified'}
- Average Accuracy: ${studentProfile.averageAccuracy || 'N/A'}%
- Total Tests: ${studentProfile.totalTests || 0}
- Target Score: ${studentProfile.targetScore || '600+'}

Create a day-by-day plan:
For each day include:
- Morning: Specific chapters/topics to revise
- Afternoon: Practice questions (count and difficulty)
- Evening: Mock test or topic test
- Night: Revision and mistake analysis

Make it practical and achievable.`;

      const plan = await getGeminiText({
        prompt,
        maxOutputTokens: 1400,
        temperature: 0.35
      });

      return {
        plan,
        createdAt: new Date()
      };

    } catch (error) {
      console.error('❌ Study Plan Generation Error:', error);
      return {
        plan: 'Unable to generate study plan',
        error: error.message
      };
    }
  }

  /**
   * Generate doubt explanation
   * @param {Object} questionData - Question and context
   * @param {string} doubt - Student's doubt
   * @returns {Promise<string>} Explanation
   */
  static async explainDoubt(questionData, doubt) {
    try {
      const prompt = `You are a NEET tutor. A student has a doubt about this question:

Question: ${questionData.questionText}

Options:
A. ${questionData.options.A?.text || questionData.options.A}
B. ${questionData.options.B?.text || questionData.options.B}
C. ${questionData.options.C?.text || questionData.options.C}
D. ${questionData.options.D?.text || questionData.options.D}

Correct Answer: ${questionData.correctAnswer}

Student's Doubt: ${doubt}

Provide a clear, step-by-step explanation addressing their specific doubt. Use simple language and relevant examples.`;

      const explanation = await getGeminiText({
        systemInstruction: 'You are a helpful NEET tutor. Explain concepts clearly and patiently.',
        prompt,
        maxOutputTokens: 800,
        temperature: 0.25
      });

      return explanation;

    } catch (error) {
      console.error('❌ Doubt Explanation Error:', error);
      throw new Error('Unable to generate explanation');
    }
  }

  /**
   * Predict NEET rank
   * @param {number} score - Student's score
   * @param {Object} performance - Performance metrics
   * @returns {Promise<Object>} Rank prediction
   */
  static async predictNEETRank(score, performance = {}) {
    try {
      // Simplified rank prediction based on historical data
      let rankMin, rankMax, percentile;

      if (score >= 600) {
        rankMin = 1;
        rankMax = 5000;
        percentile = 99;
      } else if (score >= 550) {
        rankMin = 5000;
        rankMax = 15000;
        percentile = 98;
      } else if (score >= 500) {
        rankMin = 15000;
        rankMax = 30000;
        percentile = 95;
      } else if (score >= 450) {
        rankMin = 30000;
        rankMax = 50000;
        percentile = 90;
      } else if (score >= 400) {
        rankMin = 50000;
        rankMax = 100000;
        percentile = 80;
      } else {
        rankMin = 100000;
        rankMax = 200000;
        percentile = 50;
      }

      // Adjust based on performance data
      if (performance.consistency === 'high') {
        rankMin = Math.max(1, rankMin - 5000);
      }

      return {
        estimatedRank: {
          min: rankMin,
          max: rankMax
        },
        percentile,
        score,
        message: `Based on your score of ${score}, your estimated NEET rank is between ${rankMin} and ${rankMax}.`,
        prediction: this.rankToCollegeType(rankMin)
      };

    } catch (error) {
      console.error('❌ Rank Prediction Error:', error);
      return {
        error: 'Unable to predict rank',
        message: error.message
      };
    }
  }

  /**
   * Rank to college type mapping
   * @param {number} rank - NEET rank
   * @returns {string} College type
   */
  static rankToCollegeType(rank) {
    if (rank <= 100) return 'AIIMS/Top Government Medical College';
    if (rank <= 1000) return 'Top Tier Government Medical College';
    if (rank <= 10000) return 'Good Government Medical College';
    if (rank <= 50000) return 'State Government Medical College';
    if (rank <= 100000) return 'Private Medical College (Top)';
    return 'Private Medical College (Moderate)';
  }

  /**
   * Prepare analysis data from test attempt
   * @param {Object} testAttempt - Test attempt document
   * @returns {Object} Prepared data
   */
  static prepareAnalysisData(testAttempt) {
    return {
      overallScore: testAttempt.score,
      maxScore: testAttempt.maxScore,
      accuracy: testAttempt.analysis?.accuracy || 0,
      timeSpent: testAttempt.totalTimeSpent,
      subjectAnalysis: testAttempt.subjectAnalysis || {},
      questionsAttempted: testAttempt.analysis?.totalQuestionsAttempted || 0,
      questionsCorrect: testAttempt.analysis?.totalQuestionsCorrect || 0,
      questionsWrong: testAttempt.analysis?.totalQuestionsWrong || 0,
      questionsSkipped: testAttempt.analysis?.totalQuestionsSkipped || 0,
      averageTimePerQuestion: testAttempt.analysis?.averageTimePerQuestion || 0,
      negativeMarks: testAttempt.analysis?.negativeMarksCount || 0
    };
  }
}

module.exports = AIAnalyzer;

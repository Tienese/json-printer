package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.quiz.UserAnswer;
import com.qtihelper.demo.dto.quiz.UserQuestion;
import com.qtihelper.demo.dto.quiz.UserQuizJson;
import com.qtihelper.demo.util.XmlUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for generating QTI 1.2 Content XML (quiz_content.xml).
 * Converts UserQuizJson into Canvas-compatible QTI format.
 */
@Service
public class QtiContentGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(QtiContentGeneratorService.class);

    /**
     * Result record containing both QTI content and assessment identifier.
     */
    public record QtiGenerationResult(String content, String assessmentIdent) {
    }

    // XML Structure Constants
    private static final String GT_NEWLINE = ">\n";
    private static final String QUESTION_PREFIX = "question_";
    private static final String RESPONSE_PREFIX = "response_";

    // Item-level constants (items are now nested inside assessment > section)
    private static final String ITEM_IDENT_START = "      <item ident=\"";
    private static final String TITLE_ATTR = "\" title=\"";
    private static final String ITEM_END = "      </item>\n";

    // Metadata constants
    private static final String METADATA_FIELD_START = "          <qtimetadatafield>\n";
    private static final String METADATA_FIELD_END = "          </qtimetadatafield>\n";
    private static final String ITEMMETADATA_START = "      <itemmetadata>\n";
    private static final String ITEMMETADATA_END = "      </itemmetadata>\n";
    private static final String QTIMETADATA_START = "        <qtimetadata>\n";
    private static final String QTIMETADATA_END = "        </qtimetadata>\n";
    private static final String FIELDLABEL_QUESTION_TYPE = "            <fieldlabel>question_type</fieldlabel>\n";
    private static final String FIELDLABEL_POINTS_POSSIBLE = "            <fieldlabel>points_possible</fieldlabel>\n";
    private static final String FIELDENTRY_START = "            <fieldentry>";
    private static final String FIELDENTRY_END = "</fieldentry>\n";

    // Presentation constants
    private static final String PRESENTATION_START = "      <presentation>\n";
    private static final String PRESENTATION_END = "      </presentation>\n";
    private static final String MATERIAL_START = "          <material>\n";
    private static final String MATERIAL_END = "          </material>\n";
    private static final String INNER_MATERIAL_START = "              <material>\n";
    private static final String INNER_MATERIAL_END = "              </material>\n";
    private static final String MATTEXT_HTML_START = "            <mattext texttype=\"text/html\">";
    private static final String MATTEXT_HTML_END = "</mattext>\n";
    private static final String MATTEXT_PLAIN_START = "                <mattext texttype=\"text/plain\">";

    // Response constants
    private static final String RESPONSE_LID_START = "        <response_lid ident=\"";
    private static final String RESPONSE_LID_END = "        </response_lid>\n";
    private static final String RENDER_CHOICE_START = "          <render_choice>\n";
    private static final String RENDER_CHOICE_END = "          </render_choice>\n";
    private static final String RESPONSE_LABEL_START = "            <response_label ident=\"";
    private static final String RESPONSE_LABEL_END = "            </response_label>\n";

    // Response processing constants
    private static final String CONDITIONVAR_START = "          <conditionvar>\n";
    private static final String CONDITIONVAR_END = "          </conditionvar>\n";
    private static final String VAREQUAL_START = "            <varequal respident=\"";
    private static final String VAREQUAL_END = "</varequal>\n";
    private static final String RESPCONDITION_END = "        </respcondition>\n";

    // Feedback constants
    private static final String FLOW_MAT_START = "        <flow_mat>\n";
    private static final String FLOW_MAT_END = "        </flow_mat>\n";
    private static final String FEEDBACK_END = "      </itemfeedback>\n";
    private static final String ANSWER_PREFIX = "answer_";

    /**
     * Generate complete QTI content XML for a quiz.
     *
     * @param quiz UserQuizJson object containing quiz data
     * @return QtiGenerationResult containing XML content and assessment identifier
     */
    public QtiGenerationResult generateQtiContent(UserQuizJson quiz) {
        log.info("Generating QTI content for quiz: {}", quiz.getTitle());

        StringBuilder xml = new StringBuilder();

        // XML Declaration
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");

        // Generate assessment ident (will be used for manifest linking)
        String assessmentId = "g" + UUID.randomUUID().toString().replace("-", "");

        xml.append("<questestinterop xmlns=\"http://www.imsglobal.org/xsd/ims_qtiasiv1p2\" ");
        xml.append("xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" ");
        xml.append("xsi:schemaLocation=\"http://www.imsglobal.org/xsd/ims_qtiasiv1p2 ");
        xml.append("http://www.imsglobal.org/xsd/ims_qtiasiv1p2p1.xsd\">\n");

        // Assessment root (for Canvas Quiz, not Question Bank)
        xml.append("  <assessment ident=\"").append(assessmentId).append("\" title=\"");
        xml.append(XmlUtils.escape(quiz.getTitle())).append("\">\n");

        // Assessment-level QTI metadata (cc_maxattempts)
        xml.append("    <qtimetadata>\n");
        xml.append("      <qtimetadatafield>\n");
        xml.append("        <fieldlabel>cc_maxattempts</fieldlabel>\n");
        xml.append("        <fieldentry>1</fieldentry>\n");
        xml.append("      </qtimetadatafield>\n");
        xml.append("    </qtimetadata>\n");

        // Section wrapper (required by Canvas assessment structure)
        xml.append("    <section ident=\"root_section\">\n");

        // Generate each question (children of section)
        for (int i = 0; i < quiz.getQuestions().size(); i++) {
            UserQuestion question = quiz.getQuestions().get(i);
            String questionXml = generateQuestion(question, i + 1);
            xml.append(questionXml);
        }

        xml.append("    </section>\n");
        xml.append("  </assessment>\n");
        xml.append("</questestinterop>\n");

        log.info("Generated QTI content with {} questions ({} bytes)",
                quiz.getQuestions().size(), xml.length());
        return new QtiGenerationResult(xml.toString(), assessmentId);
    }

    /**
     * Generate XML for a single question based on its type.
     */
    private String generateQuestion(UserQuestion question, int questionNumber) {
        String type = question.getType().toUpperCase();

        log.debug("Generating question #{} (type: {})", questionNumber, type);

        return switch (type) {
            case "MC", "TF" -> generateMultipleChoice(question);
            case "MA" -> generateMultipleAnswer(question);
            case "MD", "DD" -> generateMultipleDropdown(question);
            case "MT" -> generateMatching(question);
            default -> {
                log.warn("Unsupported question type: {}, defaulting to MC", type);
                yield generateMultipleChoice(question);
            }
        };
    }

    /**
     * Generate Multiple Choice or True/False question.
     */
    private String generateMultipleChoice(UserQuestion question) {
        String itemId = QUESTION_PREFIX + UUID.randomUUID().toString().replace("-", "");
        String responseId = RESPONSE_PREFIX + UUID.randomUUID().toString().replace("-", "");

        StringBuilder xml = new StringBuilder();

        xml.append(ITEM_IDENT_START).append(itemId).append(TITLE_ATTR).append(XmlUtils.escape(question.getTitle()))
                .append("\"").append(GT_NEWLINE);

        // Metadata
        xml.append(ITEMMETADATA_START);
        xml.append(QTIMETADATA_START);
        xml.append(METADATA_FIELD_START);
        xml.append(FIELDLABEL_QUESTION_TYPE);
        xml.append(FIELDENTRY_START).append("multiple_choice_question").append(FIELDENTRY_END);
        xml.append(METADATA_FIELD_END);
        xml.append(METADATA_FIELD_START);
        xml.append(FIELDLABEL_POINTS_POSSIBLE);
        xml.append(FIELDENTRY_START).append(question.getPoints()).append(FIELDENTRY_END);
        xml.append(METADATA_FIELD_END);
        xml.append(QTIMETADATA_END);
        xml.append(ITEMMETADATA_END);

        // Presentation
        xml.append(PRESENTATION_START);
        xml.append(MATERIAL_START);
        xml.append(MATTEXT_HTML_START).append(XmlUtils.escape(question.getPrompt()))
                .append(MATTEXT_HTML_END);
        xml.append(MATERIAL_END);

        // Response (Single cardinality for MC/TF)
        xml.append(RESPONSE_LID_START).append(responseId).append("\" rcardinality=\"Single\">\n");
        xml.append(RENDER_CHOICE_START);

        // Answer choices
        for (int i = 0; i < question.getAnswers().size(); i++) {
            UserAnswer answer = question.getAnswers().get(i);
            String answerId = ANSWER_PREFIX + i;

            xml.append(RESPONSE_LABEL_START).append(answerId).append("\"").append(GT_NEWLINE);
            xml.append(INNER_MATERIAL_START);
            xml.append(MATTEXT_PLAIN_START).append(XmlUtils.escape(answer.getText()))
                    .append(MATTEXT_HTML_END);
            xml.append(INNER_MATERIAL_END);
            xml.append(RESPONSE_LABEL_END);
        }

        xml.append(RENDER_CHOICE_END);
        xml.append(RESPONSE_LID_END);
        xml.append(PRESENTATION_END);

        // Response processing
        xml.append(generateResponseProcessingWithPerAnswerFeedback(question, responseId));

        // Feedback
        xml.append(generateFeedback(question));

        xml.append(ITEM_END);

        return xml.toString();
    }

    /**
     * Generate Multiple Answer question.
     */
    private String generateMultipleAnswer(UserQuestion question) {
        String itemId = QUESTION_PREFIX + UUID.randomUUID().toString().replace("-", "");
        String responseId = RESPONSE_PREFIX + UUID.randomUUID().toString().replace("-", "");

        StringBuilder xml = new StringBuilder();

        xml.append(ITEM_IDENT_START).append(itemId).append(TITLE_ATTR).append(XmlUtils.escape(question.getTitle()))
                .append(GT_NEWLINE);

        // Metadata
        xml.append(ITEMMETADATA_START);
        xml.append(QTIMETADATA_START);
        xml.append(METADATA_FIELD_START);
        xml.append(FIELDLABEL_QUESTION_TYPE);
        xml.append(FIELDENTRY_START).append("multiple_answers_question").append(FIELDENTRY_END);
        xml.append(METADATA_FIELD_END);
        xml.append(METADATA_FIELD_START);
        xml.append(FIELDLABEL_POINTS_POSSIBLE);
        xml.append(FIELDENTRY_START).append(question.getPoints()).append(FIELDENTRY_END);
        xml.append(METADATA_FIELD_END);
        xml.append(QTIMETADATA_END);
        xml.append(ITEMMETADATA_END);

        // Presentation
        xml.append(PRESENTATION_START);
        xml.append(MATERIAL_START);
        xml.append(MATTEXT_HTML_START).append(XmlUtils.escape(question.getPrompt()))
                .append(MATTEXT_HTML_END);
        xml.append(MATERIAL_END);

        // Response (Multiple cardinality for MA)
        xml.append(RESPONSE_LID_START).append(responseId).append("\" rcardinality=\"Multiple\">\n");
        xml.append(RENDER_CHOICE_START);

        // Answer choices
        for (int i = 0; i < question.getAnswers().size(); i++) {
            UserAnswer answer = question.getAnswers().get(i);
            String answerId = ANSWER_PREFIX + i;

            xml.append(RESPONSE_LABEL_START).append(answerId).append("\"").append(GT_NEWLINE);
            xml.append(INNER_MATERIAL_START);
            xml.append(MATTEXT_PLAIN_START).append(XmlUtils.escape(answer.getText()))
                    .append(MATTEXT_HTML_END);
            xml.append(INNER_MATERIAL_END);
            xml.append(RESPONSE_LABEL_END);
        }

        xml.append(RENDER_CHOICE_END);
        xml.append(RESPONSE_LID_END);
        xml.append(PRESENTATION_END);

        // Response processing
        xml.append(generateResponseProcessingWithPerAnswerFeedback(question, responseId));

        // Feedback
        xml.append(generateFeedback(question));

        xml.append(ITEM_END);

        return xml.toString();
    }

    /**
     * Generate Multiple Dropdown question.
     */
    private String generateMultipleDropdown(UserQuestion question) {
        String itemId = QUESTION_PREFIX + UUID.randomUUID().toString().replace("-", "");
        StringBuilder xml = new StringBuilder();

        xml.append(ITEM_IDENT_START).append(itemId).append(TITLE_ATTR).append(XmlUtils.escape(question.getTitle()))
                .append(GT_NEWLINE);

        // Metadata
        xml.append(ITEMMETADATA_START);
        xml.append(QTIMETADATA_START);
        xml.append(METADATA_FIELD_START);
        xml.append(FIELDLABEL_QUESTION_TYPE);
        xml.append(FIELDENTRY_START).append("multiple_dropdowns_question").append(FIELDENTRY_END);
        xml.append(METADATA_FIELD_END);
        xml.append(METADATA_FIELD_START);
        xml.append(FIELDLABEL_POINTS_POSSIBLE);
        xml.append(FIELDENTRY_START).append(question.getPoints()).append(FIELDENTRY_END);
        xml.append(METADATA_FIELD_END);
        xml.append(QTIMETADATA_END);
        xml.append(ITEMMETADATA_END);

        // Presentation
        xml.append(PRESENTATION_START);
        xml.append(MATERIAL_START);
        xml.append(MATTEXT_HTML_START).append(XmlUtils.escape(question.getPrompt()))
                .append(MATTEXT_HTML_END);
        xml.append(MATERIAL_END);

        // Group answers by blankId
        java.util.Map<String, List<UserAnswer>> blanks = question.getAnswers().stream()
                .filter(a -> a.getBlankId() != null)
                .collect(Collectors.groupingBy(UserAnswer::getBlankId));

        if (blanks.isEmpty()) {
            // Fallback to MC-like behavior if no blanks identified
            return generateMultipleChoice(question);
        }

        for (java.util.Map.Entry<String, List<UserAnswer>> entry : blanks.entrySet()) {
            String blankId = entry.getKey();
            List<UserAnswer> options = entry.getValue();
            String responseId = RESPONSE_PREFIX + blankId;

            xml.append(RESPONSE_LID_START).append(responseId).append("\" rcardinality=\"Single\">\n");
            xml.append(RENDER_CHOICE_START);

            for (int i = 0; i < options.size(); i++) {
                UserAnswer opt = options.get(i);
                String optId = "opt_" + blankId + "_" + i;
                xml.append(RESPONSE_LABEL_START).append(optId).append(GT_NEWLINE);
                xml.append(INNER_MATERIAL_START);
                xml.append(MATTEXT_PLAIN_START).append(XmlUtils.escape(opt.getText()))
                        .append(MATTEXT_HTML_END);
                xml.append(INNER_MATERIAL_END);
                xml.append(RESPONSE_LABEL_END);
            }

            xml.append(RENDER_CHOICE_END);
            xml.append(RESPONSE_LID_END);
        }

        xml.append(PRESENTATION_END);

        // Simplified resprocessing for MD
        xml.append("      <resprocessing>\n");
        xml.append("        <outcomes>\n");
        xml.append("          <decvar maxvalue=\"100\" minvalue=\"0\" varname=\"SCORE\" vartype=\"Decimal\"/>\n");
        xml.append("        </outcomes>\n");

        for (java.util.Map.Entry<String, List<UserAnswer>> entry : blanks.entrySet()) {
            String blankId = entry.getKey();
            List<UserAnswer> options = entry.getValue();
            String responseId = RESPONSE_PREFIX + blankId;

            for (int i = 0; i < options.size(); i++) {
                UserAnswer opt = options.get(i);
                if (opt.getCorrect() != null && opt.getCorrect()) {
                    xml.append("        <respcondition>\n");
                    xml.append(CONDITIONVAR_START);
                    xml.append(VAREQUAL_START).append(responseId).append("\">")
                            .append("opt_").append(blankId).append("_").append(i).append(VAREQUAL_END);
                    xml.append(CONDITIONVAR_END);
                    xml.append("          <setvar action=\"Add\" varname=\"SCORE\">")
                            .append(100.0 / blanks.size()).append("</setvar>\n");
                    xml.append(RESPCONDITION_END);
                }
            }
        }
        xml.append("      </resprocessing>\n");

        // Feedback
        xml.append(generateFeedback(question));

        xml.append(ITEM_END);

        return xml.toString();
    }

    private String generateMatching(UserQuestion question) {
        log.warn("Matching questions have simplified implementation, converting to MD/MC format");
        return generateMultipleChoice(question);
    }

    /**
     * Generate response processing block with per-answer feedback (N+2 conditions).
     * Implements the ObjectBank format requirement for granular feedback.
     */
    private String generateResponseProcessingWithPerAnswerFeedback(UserQuestion question, String responseId) {
        StringBuilder xml = new StringBuilder();

        xml.append("      <resprocessing>\n");
        xml.append("        <outcomes>\n");
        xml.append("          <decvar maxvalue=\"100\" minvalue=\"0\" varname=\"SCORE\" vartype=\"Decimal\"/>\n");
        xml.append("        </outcomes>\n");

        // PHASE 1: Per-answer feedback
        addPerAnswerFeedbackConditions(question, responseId, xml);

        // PHASE 2: General feedback
        addGeneralFeedbackCondition(question, xml);

        // PHASE 3 & 4: Scoring
        addScoringConditions(question, responseId, xml);

        xml.append("      </resprocessing>\n");
        return xml.toString();
    }

    private void addPerAnswerFeedbackConditions(UserQuestion question, String responseId, StringBuilder xml) {
        for (int i = 0; i < question.getAnswers().size(); i++) {
            UserAnswer answer = question.getAnswers().get(i);
            String answerId = ANSWER_PREFIX + i;

            if (answer.getFeedback() != null && !answer.getFeedback().isBlank()) {
                xml.append("        <respcondition continue=\"Yes\">\n");
                xml.append(CONDITIONVAR_START);
                xml.append(VAREQUAL_START).append(responseId).append("\">")
                        .append(answerId).append(VAREQUAL_END);
                xml.append(CONDITIONVAR_END);
                xml.append("          <displayfeedback feedbacktype=\"Response\" linkrefid=\"")
                        .append(answerId).append("_fb\"/>\n");
                xml.append(RESPCONDITION_END);
            }
        }
    }

    private void addGeneralFeedbackCondition(UserQuestion question, StringBuilder xml) {
        if (question.getGeneralFeedback() != null && !question.getGeneralFeedback().isBlank()) {
            xml.append("        <respcondition continue=\"Yes\">\n");
            xml.append(CONDITIONVAR_START);
            xml.append("            <other/>\n");
            xml.append(CONDITIONVAR_END);
            xml.append("          <displayfeedback feedbacktype=\"Response\" linkrefid=\"general_fb\"/>\n");
            xml.append(RESPCONDITION_END);
        }
    }

    private void addScoringConditions(UserQuestion question, String responseId, StringBuilder xml) {
        List<String> correctAnswerIds = question.getAnswers().stream()
                .filter(a -> a.getCorrect() != null && a.getCorrect())
                .map(a -> ANSWER_PREFIX + question.getAnswers().indexOf(a))
                .toList();

        // Correct condition
        if (!correctAnswerIds.isEmpty()) {
            xml.append("        <respcondition continue=\"No\">\n");
            xml.append(CONDITIONVAR_START);
            if (correctAnswerIds.size() == 1) {
                xml.append(VAREQUAL_START).append(responseId).append("\">")
                        .append(correctAnswerIds.get(0)).append(VAREQUAL_END);
            } else {
                xml.append("            <and>\n");
                for (String answerId : correctAnswerIds) {
                    xml.append("              <varequal respident=\"").append(responseId).append("\">")
                            .append(answerId).append(VAREQUAL_END);
                }
                xml.append("            </and>\n");
            }
            xml.append(CONDITIONVAR_END);
            xml.append("          <setvar action=\"Set\" varname=\"SCORE\">100</setvar>\n");
            if (question.getCorrectFeedback() != null && !question.getCorrectFeedback().isBlank()) {
                xml.append("          <displayfeedback feedbacktype=\"Response\" linkrefid=\"correct_fb\"/>\n");
            }
            xml.append(RESPCONDITION_END);
        }

        // Incorrect fallback
        xml.append("        <respcondition continue=\"No\">\n");
        xml.append(CONDITIONVAR_START);
        xml.append("            <other/>\n");
        xml.append(CONDITIONVAR_END);
        xml.append("          <setvar action=\"Set\" varname=\"SCORE\">0</setvar>\n");
        if (question.getIncorrectFeedback() != null && !question.getIncorrectFeedback().isBlank()) {
            xml.append("          <displayfeedback feedbacktype=\"Response\" linkrefid=\"incorrect_fb\"/>\n");
        }
        xml.append(RESPCONDITION_END);
    }

    /**
     * Generate feedback blocks (including per-answer feedback).
     */
    private String generateFeedback(UserQuestion question) {
        StringBuilder xml = new StringBuilder();

        // Per-answer feedback blocks
        for (int i = 0; i < question.getAnswers().size(); i++) {
            UserAnswer answer = question.getAnswers().get(i);
            String answerId = ANSWER_PREFIX + i;

            // Only generate if answer has specific feedback
            if (answer.getFeedback() != null && !answer.getFeedback().isBlank()) {
                xml.append("      <itemfeedback ident=\"").append(answerId).append("_fb\">\n");
                xml.append(FLOW_MAT_START);
                xml.append(MATERIAL_START);
                xml.append(MATTEXT_HTML_START)
                        .append(XmlUtils.escape(answer.getFeedback())).append(MATTEXT_HTML_END);
                xml.append(MATERIAL_END);
                xml.append(FLOW_MAT_END);
                xml.append(FEEDBACK_END);
            }
        }

        // General feedback
        if (question.getGeneralFeedback() != null && !question.getGeneralFeedback().isBlank()) {
            xml.append("      <itemfeedback ident=\"general_fb\">\n");
            xml.append(FLOW_MAT_START);
            xml.append(MATERIAL_START);
            xml.append(MATTEXT_HTML_START)
                    .append(XmlUtils.escape(question.getGeneralFeedback())).append(MATTEXT_HTML_END);
            xml.append(MATERIAL_END);
            xml.append(FLOW_MAT_END);
            xml.append(FEEDBACK_END);
        }

        // Correct feedback
        if (question.getCorrectFeedback() != null && !question.getCorrectFeedback().isBlank()) {
            xml.append("      <itemfeedback ident=\"correct_fb\">\n");
            xml.append(FLOW_MAT_START);
            xml.append(MATERIAL_START);
            xml.append(MATTEXT_HTML_START)
                    .append(XmlUtils.escape(question.getCorrectFeedback())).append(MATTEXT_HTML_END);
            xml.append(MATERIAL_END);
            xml.append(FLOW_MAT_END);
            xml.append(FEEDBACK_END);
        }

        // Incorrect feedback
        if (question.getIncorrectFeedback() != null && !question.getIncorrectFeedback().isBlank()) {
            xml.append("      <itemfeedback ident=\"incorrect_fb\">\n");
            xml.append(FLOW_MAT_START);
            xml.append(MATERIAL_START);
            xml.append(MATTEXT_HTML_START)
                    .append(XmlUtils.escape(question.getIncorrectFeedback())).append(MATTEXT_HTML_END);
            xml.append(MATERIAL_END);
            xml.append(FLOW_MAT_END);
            xml.append(FEEDBACK_END);
        }

        return xml.toString();
    }

}

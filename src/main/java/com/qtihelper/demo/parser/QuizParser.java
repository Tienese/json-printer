package com.qtihelper.demo.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtihelper.demo.model.*;
import com.qtihelper.demo.parser.dto.*;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class QuizParser {

    private static final Logger log = LoggerFactory.getLogger(QuizParser.class);
    private final ObjectMapper objectMapper;

    public QuizParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Quiz parse(Path filePath) throws IOException {
        log.info("Parsing JSON file: {}", filePath);
        QuizDto quizDto = objectMapper.readValue(filePath.toFile(), QuizDto.class);
        return mapDtoToModel(quizDto);
    }

    private Quiz mapDtoToModel(QuizDto dto) {
        Quiz quiz = new Quiz();
        quiz.setTitle(dto.title() != null ? dto.title() : "Untitled Quiz");
        quiz.setDescription(dto.description() != null ? dto.description() : "");

        if (dto.questions() != null) {
            for (QuestionDto qDto : dto.questions()) {
                try {
                    quiz.addQuestion(mapQuestion(qDto));
                } catch (IllegalArgumentException e) {
                    log.warn("Skipping invalid question '{}': {}", qDto.title(), e.getMessage());
                }
            }
        }
        return quiz;
    }

    private Question mapQuestion(QuestionDto dto) {
        Question q = new Question();
        q.setTitle(dto.title());
        q.appendPromptLine(dto.prompt());

        q.setPoints(Optional.ofNullable(dto.points()).orElse(1.0));

        if (dto.type() == null) {
            throw new IllegalArgumentException("Question type is missing");
        }
        q.setTypeFromCode(dto.type());

        q.setGeneralFeedback(dto.generalFeedback());
        q.setCorrectFeedback(dto.correctFeedback());
        q.setIncorrectFeedback(dto.incorrectFeedback());

        // 1. Basic Answer Mapping
        if (dto.answers() != null) {
            for (AnswerDto ansDto : dto.answers()) {
                AnswerOption ans = new AnswerOption(ansDto.text(), ansDto.correct());
                ans.setFeedback(ansDto.feedback());
                ans.setDropdownVariable(ansDto.dropdownVariable());
                q.addAnswer(ans);
            }
        }

        // 2. Explicit Matching Mapping (if provided in JSON)
        if (dto.matchingPairs() != null) {
            for (MatchingPairDto pair : dto.matchingPairs()) {
                q.addMatchingPair(pair.left(), pair.right());
            }
        }

        if (dto.matchingDistractors() != null) {
            for (String dist : dto.matchingDistractors()) {
                q.addMatchingDistractor(dist);
            }
        }

        // --- FIX STARTS HERE ---

        // 3. Post-Processing: Handle "Flat" data for Matching
        // If we have answers but no pairs, assume user typed "Key : Value" in answer
        // text
        if (q.getType() == QuestionType.MATCHING && q.getMatchingPairs().isEmpty() && !q.getAnswers().isEmpty()) {
            for (AnswerOption ans : q.getAnswers()) {
                String text = ans.getText();
                if (text != null && text.contains(":")) {
                    String[] parts = text.split(":", 2);
                    String left = parts[0].trim();
                    String right = parts[1].trim();
                    q.addMatchingPair(left, right);
                } else if (text != null) {
                    // Fallback: Use text as both key and value, or treat as distractor
                    q.addMatchingDistractor(text);
                }
            }
        }

        // 4. Post-Processing: Handle "Flat" data for Dropdowns
        // If variable is missing, check if user typed "varname : answer text"
        if (q.getType() == QuestionType.MULTIPLE_DROPDOWN && !q.getAnswers().isEmpty()) {
            boolean anyVarSet = q.getAnswers().stream().anyMatch(a -> a.getDropdownVariable() != null);

            if (!anyVarSet) {
                for (AnswerOption ans : q.getAnswers()) {
                    String text = ans.getText();
                    if (text != null && text.contains(":")) {
                        String[] parts = text.split(":", 2);
                        String variable = parts[0].trim(); // e.g., "time"
                        String displayValue = parts[1].trim(); // e.g., "tomorrow"

                        ans.setDropdownVariable(variable);
                        ans.setText(displayValue); // Clean up the text for display
                    } else {
                        // If no variable specified, default to "unknown" or specific fallback
                        ans.setDropdownVariable("unknown");
                    }
                }
            }
        }
        // --- FIX ENDS HERE ---

        return q;
    }
}
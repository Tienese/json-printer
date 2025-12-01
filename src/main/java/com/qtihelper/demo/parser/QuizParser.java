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

        if (dto.answers() != null) {
            for (AnswerDto ansDto : dto.answers()) {
                AnswerOption ans = new AnswerOption(ansDto.text(), ansDto.correct());
                ans.setFeedback(ansDto.feedback());
                ans.setDropdownVariable(ansDto.dropdownVariable());
                q.addAnswer(ans);
            }
        }

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

        return q;
    }
}
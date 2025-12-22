package com.qtihelper.demo.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @Column(nullable = false)
    private Long id; // Canvas ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question_name")
    private String questionName;

    @Column(name = "question_text", columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "question_type")
    private String questionType;

    private Integer position;

    @Column(name = "points_possible")
    private Double pointsPossible;

    @Column(name = "correct_comments", columnDefinition = "TEXT")
    private String correctComments;

    @Column(name = "incorrect_comments", columnDefinition = "TEXT")
    private String incorrectComments;

    @Column(name = "neutral_comments", columnDefinition = "TEXT")
    private String neutralComments;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Answer> answers = new ArrayList<>();

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Match> matches = new ArrayList<>();

    // Constructors
    public Question() {}

    public Question(Long id, String questionName, String questionText, String questionType, Integer position, Double pointsPossible) {
        this.id = id;
        this.questionName = questionName;
        this.questionText = questionText;
        this.questionType = questionType;
        this.position = position;
        this.pointsPossible = pointsPossible;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public String getQuestionName() {
        return questionName;
    }

    public void setQuestionName(String questionName) {
        this.questionName = questionName;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public Double getPointsPossible() {
        return pointsPossible;
    }

    public void setPointsPossible(Double pointsPossible) {
        this.pointsPossible = pointsPossible;
    }

    public String getCorrectComments() {
        return correctComments;
    }

    public void setCorrectComments(String correctComments) {
        this.correctComments = correctComments;
    }

    public String getIncorrectComments() {
        return incorrectComments;
    }

    public void setIncorrectComments(String incorrectComments) {
        this.incorrectComments = incorrectComments;
    }

    public String getNeutralComments() {
        return neutralComments;
    }

    public void setNeutralComments(String neutralComments) {
        this.neutralComments = neutralComments;
    }

    public List<Answer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<Answer> answers) {
        this.answers = answers;
    }

    public void addAnswer(Answer answer) {
        answers.add(answer);
        answer.setQuestion(this);
    }

    public List<Match> getMatches() {
        return matches;
    }

    public void setMatches(List<Match> matches) {
        this.matches = matches;
    }

    public void addMatch(Match match) {
        matches.add(match);
        match.setQuestion(this);
    }
}

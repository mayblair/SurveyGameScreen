import java.awt.*;
import java.util.HashMap;
import javax.swing.*;

public class SurveyGameScreen extends JFrame {

    // -----------------------------
    // Game Data
    // -----------------------------

    private String questionText = "";

    private String[] answerChoices = {
            "",
            "",
            "",
            ""
    };

    private int correctAnswerIndex = 0; // Mars

    private String[] groups = {
            "Class 1",
            "Class 2",
            "Class 3",
            "Class 4"
    };

    // Map: group -> score
    private HashMap<String, Integer> groupScores = new HashMap<>();

    // Map: group -> number of responses this round
    private HashMap<String, Integer> groupResponses = new HashMap<>();

    private boolean hasAnswered = false;
    private RoundedButton[] answerButtons;

    // -----------------------------
    // UI Components
    // -----------------------------

    private JPanel mainPanel;
    private JPanel groupPanel;
    private JPanel questionPanel;
    private JPanel answerPanel;
    private JPanel resultsPanel;

    private JLabel questionLabel;
    private JLabel statusLabel;

    private String selectedGroup = null;

    // -----------------------------
    // Constructor
    // -----------------------------

    public SurveyGameScreen() {
        setTitle("Survey Game");
        setSize(900, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        initializeData();
        initializeUI();

        setVisible(true);
    }

    // -----------------------------
    // Initialize Data
    // -----------------------------

    private void initializeData() {
        for (String group : groups) {
            groupScores.put(group, 0);
            groupResponses.put(group, 0);
        }
    }

    // -----------------------------
    // Build UI
    // -----------------------------

    private void initializeUI() {

        mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(Color.WHITE);

        // Question Section
        questionPanel = new JPanel();
        questionPanel.setBackground(Color.WHITE);

        questionLabel = new JLabel(questionText);
        questionLabel.setFont(new Font("Arial", Font.BOLD, 22));
        questionPanel.add(questionLabel);

        // Group Selection Panel
        groupPanel = new JPanel();
        groupPanel.setLayout(new GridLayout(1, groups.length, 15, 15));
        groupPanel.setBorder(BorderFactory.createTitledBorder("Select Your Class"));

        for (String group : groups) {
            RoundedButton groupButton = new RoundedButton(group);
            groupButton.addActionListener(e -> {
                selectedGroup = group;
                statusLabel.setText("Selected: " + group);
            });
            groupPanel.add(groupButton);
        }

        // Answer Panel
        answerPanel = new JPanel();
        answerPanel.setLayout(new GridLayout(2, 2, 20, 20));
        answerPanel.setBorder(BorderFactory.createTitledBorder("Select Your Answer"));

        answerButtons = new RoundedButton[answerChoices.length];

        for (int i = 0; i < answerChoices.length; i++) {
            int index = i;

            RoundedButton answerButton = new RoundedButton(answerChoices[i]);
            answerButtons[i] = answerButton;

            answerButton.addActionListener(e -> handleAnswerSelection(index));

            answerPanel.add(answerButton);
        }


        // Results Panel
        resultsPanel = new JPanel(new BorderLayout());
        statusLabel = new JLabel("Select your group to begin.");
        statusLabel.setHorizontalAlignment(SwingConstants.CENTER);
        resultsPanel.add(statusLabel, BorderLayout.CENTER);

        JButton showResultsButton = new JButton("Show Results");
        showResultsButton.addActionListener(e -> displayResults());
        resultsPanel.add(showResultsButton, BorderLayout.SOUTH);

        // Layout Structure
        JPanel centerPanel = new JPanel(new GridLayout(2, 1));
        centerPanel.add(groupPanel);
        centerPanel.add(answerPanel);

        mainPanel.add(questionPanel, BorderLayout.NORTH);
        mainPanel.add(centerPanel, BorderLayout.CENTER);
        mainPanel.add(resultsPanel, BorderLayout.SOUTH);

        add(mainPanel);
    }

    // -----------------------------
    // Clear Answer Buttons
    // -----------------------------


    private void resetRound() {
        hasAnswered = false;

        for (RoundedButton btn : answerButtons) {
            btn.setBackground(null);
        }

        for (String group : groups) {
            groupResponses.put(group, 0);
        }

        statusLabel.setText("Select your group to begin.");
    }


    // -----------------------------
    // Handle Answer Selection
    // -----------------------------

    private void handleAnswerSelection(int answerIndex) {
        if (selectedGroup == null) {
            statusLabel.setText("Please select a group first!");
            return;
        }

        if (hasAnswered) return;

        hasAnswered = true;

        groupResponses.put(selectedGroup,
                groupResponses.get(selectedGroup) + 1);

        if (answerIndex == correctAnswerIndex) {
            groupScores.put(selectedGroup,
                    groupScores.get(selectedGroup) + 1);
            answerButtons[answerIndex].setBackground(Color.GREEN);
        } else {
            answerButtons[answerIndex].setBackground(Color.RED);
            answerButtons[correctAnswerIndex].setBackground(Color.GREEN);
        }

        statusLabel.setText("Response recorded for " + selectedGroup);
    }


    // -----------------------------
    // Display Results
    // -----------------------------

    private void displayResults() {

        StringBuilder resultsText = new StringBuilder("<html><h3>Results:</h3>");

        for (String group : groups) {
            resultsText.append(group)
                    .append(" - Score: ")
                    .append(groupScores.get(group))
                    .append(" | Responses: ")
                    .append(groupResponses.get(group))
                    .append("<br>");
        }

        resultsText.append("</html>");

        JOptionPane.showMessageDialog(this,
                resultsText.toString(),
                "Group Results",
                JOptionPane.INFORMATION_MESSAGE);
    }

    // -----------------------------
    // Main Method
    // -----------------------------

    public static void main(String[] args) {
        SwingUtilities.invokeLater(SurveyGameScreen::new);
    }
}

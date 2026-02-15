 import javax.swing.*;
import java.awt.*;

public class RoundedButton extends JButton {
    private final int radius;
    private final Color baseColor;
    private Color overrideColor = null;
    private boolean selected = false;
    private final String group;

    public RoundedButton(String pgroup) {
        super(pgroup);
        group = pgroup;
        radius = 60;
        baseColor = new Color(30, 60, 100);


        Dimension size = new Dimension(300, 50);
        this.setPreferredSize(size);
        this.setMinimumSize(size);
        this.setMaximumSize(size);


        setContentAreaFilled(false);
        setOpaque(false);
        setForeground(Color.WHITE);
        setFont(new Font("SansSerif", Font.BOLD, 26));
        setFocusPainted(false);
    }

    public void setSelectedState(boolean state) {
        this.selected = state;
        repaint();
    }

    public void setOverrideColor(Color c) {
        this.overrideColor = c;
        repaint();
    }

    public void setButtonSize(Dimension size) {
        this.setPreferredSize(size);
        this.setMinimumSize(size);
        this.setMaximumSize(size);
    }

    public void setFontSize(int size) {
        this.setFont(new Font("SansSerif", Font.BOLD, getFont().getSize()));
    }


    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        Color fillColor = overrideColor != null ? overrideColor : baseColor;

        if (!isEnabled()) {
            fillColor = fillColor.darker();
        } else if (selected) {
            fillColor = baseColor.darker();
        }

        g2.setColor(fillColor);
        g2.fillRoundRect(0, 0, getWidth() - 1, getHeight() - 1, radius, radius);

        FontMetrics fm = g2.getFontMetrics();
        int textWidth = fm.stringWidth(getText());
        int x = (getWidth() - textWidth) / 2;
        int y = (getHeight() - fm.getHeight()) / 2 + fm.getAscent();

        g2.setColor(getForeground());
        g2.drawString(getText(), x, y);

        g2.dispose();
    }

    @Override
    protected void paintBorder(Graphics g) {
        if (!selected) return;

        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setColor(Color.WHITE);
        g2.setStroke(new BasicStroke(5));
        g2.drawRoundRect(1, 1, getWidth() - 1, getHeight() - 1, radius, radius);
        g2.dispose();
    }

}

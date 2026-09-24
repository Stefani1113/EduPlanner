package EduPlanner.ed_ms_notas.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@RequiredArgsConstructor
public class EmailTemplateService {

    private final SpringTemplateEngine templateEngine;

    public String generateFinalGradeEmail(
            String studentName,
            String subjectName,
            String periodName,
            Object finalGrade,
            String status) {

        Context context = new Context();

        context.setVariable("studentName", studentName);
        context.setVariable("subjectName", subjectName);
        context.setVariable("periodName", periodName);
        context.setVariable("finalGrade", finalGrade);
        context.setVariable("status", status);

        return templateEngine.process(
                "emails/final-grade",
                context
        );
    }
}


package Nhom.VI.MoneyCare;

import static org.junit.jupiter.api.Assertions.assertEquals;

import Nhom.VI.MoneyCare.entity.SavingsGoal;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class SavingsGoalTests {
    @Test
    void initializesCreditedInterestToZeroWhenCreatingGoal() throws Exception {
        SavingsGoal goal = new ObjectMapper().readValue("""
                {
                  "name": "Tiết kiệm 9 tháng",
                  "targetAmount": 105925,
                  "interestCredited": 100000
                }
                """, SavingsGoal.class);

        goal.prePersist();

        assertEquals(BigDecimal.ZERO, goal.getInterestCredited());
    }

    @Test
    void defaultsCreditedInterestWhenItWasNotSet() {
        SavingsGoal goal = new SavingsGoal();
        goal.setInterestCredited(null);

        goal.prePersist();

        assertEquals(BigDecimal.ZERO, goal.getInterestCredited());
    }
}

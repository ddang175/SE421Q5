import list.ShapesCatalog;
import list.TimeLimitExceededException;
import shapes.*;

public class ExhaustiveCheck {
    private static Shape make(int type) {
        return switch(type) {
            case 0 -> new Circle();
            case 1 -> new Hexagon();
            case 2 -> new Oval();
            case 3 -> new Rectangle();
            case 4 -> new Square();
            default -> new Triangle();
        };
    }
    public static void main(String[] args) throws Exception {
        int[][] totals = new int[6][6];
        int[][] rewards = new int[6][6];
        int baselineTotal=0, baselineRewards=0, pairTotal=0, pairRewards=0;
        int cyclic=0;
        for(int code=0; code<46656; code++) {
            int rest=code, rectangles=0;
            int[] types=new int[6];
            Shape[] shapes=new Shape[6];
            for(int i=0;i<6;i++) {
                types[i]=rest%6;
                rest/=6;
                shapes[i]=make(types[i]);
                if(types[i]==3) rectangles++;
            }
            ShapesCatalog catalog=new ShapesCatalog(shapes);
            boolean reward=false;
            try { catalog.getStats(); }
            catch(TimeLimitExceededException e) { reward=true; cyclic++; }
            finally { catalog.destroy(); }
            boolean predicted=types[5]==3 && rectangles>=2;
            if(reward != predicted) throw new AssertionError("Prediction mismatch on layout "+code);
            for(int i=0;i<6;i++) { totals[i][types[i]]++; if(reward) rewards[i][types[i]]++; }
            if(types[3]==0) { baselineTotal++; if(reward) baselineRewards++; }
            if(types[4]==3 && types[5]==3) { pairTotal++; if(reward) pairRewards++; }
        }
        System.out.printf("ALL %d / 46656 cyclic; theorem matches all layouts%n",cyclic);
        System.out.printf("BASELINE %d / %d%n",baselineRewards,baselineTotal);
        System.out.printf("TWO RECTANGLES AT i=4,5 %d / %d%n",pairRewards,pairTotal);
        for(int i=0;i<6;i++) for(int type=0;type<6;type++) {
            if(rewards[i][type]==totals[i][type]) throw new AssertionError("One controlled slot guarantees reward");
            System.out.printf("SINGLE position=%d type=%d rewards=%d total=%d%n",i,type,rewards[i][type],totals[i][type]);
        }
    }
}

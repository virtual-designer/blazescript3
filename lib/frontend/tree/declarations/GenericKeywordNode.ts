import NodeType from "../NodeType.ts";
import KeywordNode from "./KeywordNode.ts";

class GenericKeywordNode extends KeywordNode {
    public override readonly type = NodeType.Keyword;
}

export default GenericKeywordNode;

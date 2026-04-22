import useBracketData from "./useBracketData";
import BracketDesktop from "./BracketDesktop";
import BracketMobile from "./BracketMobile";     // si ya lo creaste
import { useMediaQuery } from "react-responsive";

import { useParams } from "react-router-dom";

function BracketWrapper() {
    const { idevent, idsport } = useParams();
    const rounds = useBracketData(idevent, idsport);
    const isMobile = useMediaQuery({ maxWidth: 639 });

    return isMobile ? (
        <BracketMobile rounds={rounds} />
    ) : (
        <BracketDesktop rounds={rounds} />
    );
}

export default BracketWrapper;
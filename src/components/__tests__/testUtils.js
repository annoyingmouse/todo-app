"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderWithQuery = renderWithQuery;
var react_1 = require("react");
var react_2 = require("@testing-library/react");
var react_query_1 = require("@tanstack/react-query");
function renderWithQuery(ui) {
    var queryClient = new react_query_1.QueryClient();
    return (0, react_2.render)(<react_query_1.QueryClientProvider client={queryClient}>
      <react_1.Suspense fallback={null}>{ui}</react_1.Suspense>
    </react_query_1.QueryClientProvider>);
}

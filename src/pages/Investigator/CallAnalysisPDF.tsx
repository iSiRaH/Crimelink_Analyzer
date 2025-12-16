import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
  },
  section: {
    marginBottom: 10,
  },
  table: {
    width: '100%',
    marginTop: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eaeaea',
    fontWeight: 'bold',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 10,
  },
});

const CallAnalysisPDF = ({ results }: { results: CallAnalysisResult[] }) => {
  // Sort results by total_calls in descending order
  const sortedResults = [...results].sort((a, b) => b.total_calls - a.total_calls);

  // Group results by main_number
  const groupedByMainNumber = sortedResults.reduce((acc, result) => {
    if (!acc[result.main_number]) {
      acc[result.main_number] = [];
    }
    acc[result.main_number].push(result);
    return acc;
  }, {} as Record<string, CallAnalysisResult[]>);

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Call Analysis Report</Text>
        <Text>Date: {new Date().toLocaleDateString()}</Text>
        
        {/* Loop through each main number and create a separate section */}
        {Object.keys(groupedByMainNumber).map((mainNumber) => {
          const mainNumberResults = groupedByMainNumber[mainNumber];

          return (
            <View style={styles.section} key={mainNumber}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                Main Number: {mainNumber}
              </Text>

              {/* Table Section for the Main Number */}
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableCell}>Phone Number</Text>
                  <Text style={styles.tableCell}>Total Calls</Text>
                  <Text style={styles.tableCell}>Incoming Calls</Text>
                  <Text style={styles.tableCell}>Outgoing Calls</Text>
                </View>

                {/* Generate table rows for contacts associated with the main number */}
                {mainNumberResults.map((result) => {
                  return result.common_contacts.map((contact, idx) => {
                    const totalCalls = result.call_frequency[contact.phone] || 0;
                    const incomingCalls = result.incoming_graph.edges.filter(
                      edge => edge.source === contact.phone
                    ).reduce((sum, edge) => sum + edge.call_count, 0);
                    const outgoingCalls = result.outgoing_graph.edges.filter(
                      edge => edge.target === contact.phone
                    ).reduce((sum, edge) => sum + edge.call_count, 0);

                    return (
                      <View style={styles.tableRow} key={idx}>
                        <Text style={styles.tableCell}>{contact.phone}</Text>
                        <Text style={styles.tableCell}>{totalCalls}</Text>
                        <Text style={styles.tableCell}>{incomingCalls}</Text>
                        <Text style={styles.tableCell}>{outgoingCalls}</Text>
                      </View>
                    );
                  });
                })}
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};


interface CallAnalysisResult {
  main_number: string;
  total_calls: number;
  common_contacts: Array<{ phone: string }>;
  call_frequency: Record<string, number>;
  incoming_graph: { edges: Array<{ source: string; call_count: number }> };
  outgoing_graph: { edges: Array<{ target: string; call_count: number }> };
}

export const CallAnalysisPDFButton = ({ results }: { results: CallAnalysisResult[] }) => {
  return (
    <PDFDownloadLink
      document={<CallAnalysisPDF results={results} />}
      fileName="call_analysis_report.pdf"
    >
      {({ loading }) => (
        <button
          style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Preparing document...' : 'Download PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
};

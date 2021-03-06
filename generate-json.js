var fs = require('fs');
var awsRegionTableParser = require('./index.js');

const sortArrayByProp = (array, prop, asc = true) => {
  return array.sort((a, b) => {
    return asc ? a[prop] - b[prop] : b[prop] - a[prop];
  });
};

function generateRegionSummary(parseddata) {
  const regionSummary = sortArrayByProp(Object.values(parseddata.regionSummary), 'value', false);

  let markdownTable =`### Region Summary # \n`;
  markdownTable += `| Region Code | Region Name | no. of Supported Services | \n`;
  markdownTable += `| ------ | -------- | -------- | \n`;
  regionSummary.forEach(region => {
    markdownTable += `${region.regionCode} | ${region.regionName} | ${region.value}\n`
  });

  markdownTable += `\n\n`;

  return markdownTable;
}

awsRegionTableParser.get().then(function(servicesAndRegions) {
  fs.writeFileSync('./data/parseddata.json', JSON.stringify(servicesAndRegions, null, 2), 'utf8');

  // TODO: clean this up
  const services = Object.values(servicesAndRegions.services);
  const edgeLocations = servicesAndRegions.edgeLocations;
  const regionalEdgeCaches = servicesAndRegions.regionalEdgeCaches;

  const regions = services[0];

  let READMEheader = `### ${edgeLocations.length} Edge Locations\n`;
  READMEheader += `### ${regionalEdgeCaches.length} Regional Edge Caches\n`;
  READMEheader += `### ${services.length} Services\n\n`;
  READMEheader += generateRegionSummary(servicesAndRegions);
  READMEheader += `# Region and Service Table # \n`
  READMEheader += `| | ${Object.keys(regions).join(' | ')} |\n`;
  READMEheader += `| ------------- | ${Object.keys(regions).fill('-------------').join(' | ')}|`;
  const READMErows = [];

  for (var value in servicesAndRegions.services) {
    const longServiceName = servicesAndRegions.serviceNames[value];
    const row = `${longServiceName}|${Object.values(servicesAndRegions.services[value]).join(' | ')}`;

    READMErows.push(row);
  }

  const READMEtext = `${READMEheader}\n${READMErows.join('\n')}`;

  fs.writeFileSync('./data/README.md', READMEtext, 'utf8');
});

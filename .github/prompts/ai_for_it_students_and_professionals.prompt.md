---
description: "Create a basic AI workshop."
mode: "agent"
---

# Please create an extremely basic workshop from this project material over AI for IT Students and Professionals (Beginner - 45 minutes):

index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content="JavaScript practice code" />
    <title>JavaScript Practice</title>
    <link rel="icon" type="image/png" href="/img/favicon-16x16.png" />
    <style>
      * {
        padding: 0;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div></div>

    <script type="module">
      console.log("Hello World!");
    </script>
  </body>
</html>
```

ml-classication-lab.js

```javascript
export class KNearestNeighbors {
  constructor() {
    this.dataset = [];
  }

  // Train the model with feature-label pairs
  train(features, labels) {
    this.dataset = features.map((feature, index) => ({
      features: feature,
      label: labels[index],
    }));
  }

  // Calculate Euclidean distance between two feature vectors
  calculateDistance(a, b) {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    );
  }

  // Predict the label for given features using k=1 (nearest neighbor)
  predict(features) {
    if (this.dataset.length === 0) {
      throw new Error("Model must be trained before making predictions");
    }

    let minDist = Infinity;
    let prediction = null;

    this.dataset.forEach((sample) => {
      const dist = this.calculateDistance(sample.features, features);
      if (dist < minDist) {
        minDist = dist;
        prediction = sample.label;
      }
    });

    return prediction;
  }
}

export class DecisionTree {
  constructor() {
    this.rules = {
      feature: 2, // petal length
      thresholds: [2.5, 4.8],
      labels: ["setosa", "versicolor", "virginica"],
    };
  }

  // Predict using simple threshold rules
  predict(features) {
    const featureValue = features[this.rules.feature];

    if (featureValue <= this.rules.thresholds[0]) {
      return this.rules.labels[0];
    } else if (featureValue <= this.rules.thresholds[1]) {
      return this.rules.labels[1];
    } else {
      return this.rules.labels[2];
    }
  }
}

// Example usage and initialization with iris dataset
export function createPretrainedIrisClassifiers() {
  // Sample iris dataset
  const irisFeatures = [
    [5.1, 3.5, 1.4, 0.2],
    [7.0, 3.2, 4.7, 1.4],
    [6.3, 3.3, 6.0, 2.5],
  ];

  const irisLabels = ["setosa", "versicolor", "virginica"];

  // Create and train KNN classifier
  const knn = new KNearestNeighbors();
  knn.train(irisFeatures, irisLabels);

  // Create decision tree
  const decisionTree = new DecisionTree();

  return { knn, decisionTree };
}
```

SimpleLinearRegression.js

```javascript
export class SimpleLinearRegression {
  constructor() {
    this.slope = 0;
    this.intercept = 0;
  }

  train(x, y) {
    const n = x.length;
    const xMean = x.reduce((a, b) => a + b) / n;
    const yMean = y.reduce((a, b) => a + b) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (y[i] - yMean);
      denominator += Math.pow(x[i] - xMean, 2);
    }

    this.slope = numerator / denominator;
    this.intercept = yMean - this.slope * xMean;
  }

  predict(x) {
    return this.slope * x + this.intercept;
  }
}
```
